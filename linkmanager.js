const config = require("./config.json");

const DAY = 86400;
const RCON_TIMEOUT = 8000;
const APPLY_TRIES = 6;
const APPLY_DELAY = 700;

let sweepTimer = null;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function query(connection, sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function nowSeconds() {
    return Math.floor(Date.now() / 1000);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Never let a rejected promise escape into a mysql2 callback: that kills the process
function quiet(promise, context) {
    return promise.catch(err => {
        console.error(context + " : " + err);
        return null;
    });
}

//client.log resolves a channel and sends: its rejection would float free otherwise
function log(client, text) {
    Promise.resolve()
        .then(() => client.log(text, "staff"))
        .catch(err => console.error("Log staff impossible : " + err));
}

function boosterConf() {
    return config.booster || {};
}

//Everything the booster feature needs before it may touch anything. Fails closed.
function boosterConfigured() {
    let conf = boosterConf();
    return typeof conf.rank === "string" && conf.rank !== ""
        && Array.isArray(conf.rconPorts) && conf.rconPorts.length > 0
        && Number.isInteger(conf.days) && conf.days > 0;
}

function boosterEnabled() {
    return boosterConf().enabled === true && boosterConfigured();
}

function defaultRank() {
    return boosterConf().defaultRank || "Histerien";
}

//The five rank roles refreshrank knows how to grant
function rankRoleIds() {
    return Object.values(config.ranks || {}).filter(id => typeof id === "string" && id !== "");
}

/* ------------------------------------------------------------------ *
 * RCON
 * ------------------------------------------------------------------ */

function rconFunc(client) {
    let cmd = client.commands.get("rcon");
    if (!cmd || !cmd.config || typeof cmd.config.rconfunc !== "function") return null;
    return cmd.config.rconfunc;
}

//rconfunc only settles on the 'output' event, so it hangs forever when a server accepts
//the connection and never answers. Every call has to carry its own deadline.
function withTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
        let settled = false;
        let timer = setTimeout(() => {
            settled = true;
            reject(new Error("Pas de reponse RCON de " + label));
        }, ms);

        promise.then(value => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(value);
        }, err => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(err);
        });
    });
}

//Runs the command on the first server that answers. The game database is shared, so
//running a rank command twice would be a duplicate write, never a fallback.
async function rconFirst(client, command) {
    let run = rconFunc(client);
    if (!run) return null;

    for (const port of boosterConf().rconPorts) {
        try {
            let output = await withTimeout(run(port, command, null, port, false), RCON_TIMEOUT, port);
            return {port: port, output: output == null ? "" : String(output)};
        } catch (err) {
            console.error("RCON " + port + " injoignable pour \"" + command + "\" : " + err);
        }
    }
    return null;
}

//Best effort refresh of the players already connected on the other servers. setrank writes
//the same value everywhere, so a failure here costs nothing but a relog.
async function rconBroadcast(client, command, skipPort) {
    let run = rconFunc(client);
    if (!run) return;

    for (const port of boosterConf().rconPorts) {
        if (port === skipPort) continue;
        await withTimeout(run(port, command, null, port, false), RCON_TIMEOUT, port).catch(() => null);
    }
}

/* ------------------------------------------------------------------ *
 * Tables
 * ------------------------------------------------------------------ */

//The discord schema has no migration anywhere, its tables were created by hand.
//These two create themselves so a deploy is enough.
async function ensureTables(client) {
    await query(client.mysqldiscord,
        "CREATE TABLE IF NOT EXISTS `rankRoleGrant` (" +
        "`user` VARCHAR(20) NOT NULL, " +
        "`role` VARCHAR(20) NOT NULL, " +
        "`player` VARCHAR(20) NOT NULL, " +
        "`granted_at` INT NOT NULL, " +
        "PRIMARY KEY (`user`, `role`))");

    await query(client.mysqldiscord,
        "CREATE TABLE IF NOT EXISTS `boosterRank` (" +
        "`user` VARCHAR(20) NOT NULL PRIMARY KEY, " +
        "`player` VARCHAR(20) NOT NULL, " +
        "`old_rank` VARCHAR(32) NOT NULL, " +
        "`granted_at` INT NOT NULL, " +
        "`expire` INT NOT NULL)");
}

/* ------------------------------------------------------------------ *
 * Reading the link
 * ------------------------------------------------------------------ */

async function linkedPlayer(client, userId) {
    let rows = await query(client.mysqlingame, "SELECT `player` FROM `discord_link` WHERE `discord` = ?", [userId]);
    return rows && rows[0] ? rows[0].player : null;
}

//discord_link has `player` for primary key and no index on `discord`, so every
//WHERE discord = ? is a full table scan. A pass used to ask for one per registered member.
//Reading the column once costs exactly one scan and answers all of them.
async function loadLinks(client) {
    let rows = await query(client.mysqlingame, "SELECT `discord`, `player` FROM `discord_link`");
    let links = new Map();
    if (rows) {
        //Nothing forbids two rows for one discord id; keep the first, like linkedPlayer does,
        //and treat an empty name as no link, like linkedPlayer's caller does
        for (const row of rows) if (row.player && !links.has(row.discord)) links.set(row.discord, row.player);
    }
    return links;
}

//A player with no ranks row sits on the default rank, he is not an unknown player
async function inGameRank(client, player) {
    let rows = await query(client.mysqlingame, "SELECT `rank` FROM `ranks` WHERE `player` = ?", [player]);
    let rank = rows && rows[0] ? rows[0].rank : null;
    return rank ? rank : defaultRank();
}

//temp_rank.player is PRIMARY KEY UNIQUE: one temporary rank per player, never two
async function tempRankRow(client, player) {
    let rows = await query(client.mysqlingame, "SELECT * FROM `temp_rank` WHERE `player` = ?", [player]);
    return rows && rows[0] ? rows[0] : null;
}

async function mainMember(client, userId) {
    let guild = client.guilds.cache.get(config.serverId);
    if (!guild) return null;
    return guild.members.fetch(userId).catch(() => null);
}

function notify(member, text) {
    if (!member) return Promise.resolve(null);
    return member.send(text).catch(() => null);
}

//An uncached oldMember carries no premiumSince, so guildMemberUpdate can report a boost
//that already existed. Granting is idempotent, but the refusal messages would be sent
//again every time, so each member only hears about a refusal once.
const notified = new Set();

function notifyOnce(member, text) {
    if (!member || notified.has(member.id)) return;
    notified.add(member.id);
    notify(member, text);
}

/* ------------------------------------------------------------------ *
 * Register of the rank roles the bot posted itself
 * ------------------------------------------------------------------ */

async function rememberRole(client, userId, roleId, player) {
    if (!roleId) return;
    await quiet(query(client.mysqldiscord,
        "INSERT INTO `rankRoleGrant` (`user`, `role`, `player`, `granted_at`) VALUES (?, ?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE `player` = VALUES(`player`), `granted_at` = VALUES(`granted_at`)",
        [userId, roleId, player, nowSeconds()]), "Enregistrement du role " + roleId + " pour " + userId);
}

async function grantedRoles(client, userId) {
    let rows = await query(client.mysqldiscord, "SELECT `role` FROM `rankRoleGrant` WHERE `user` = ?", [userId]);
    return rows ? rows.map(row => row.role) : [];
}

//`keep` holds the roles whose removal just failed: their register rows stay so the next
//pass tries again, instead of forgetting a role that is still on the member.
async function forgetRoles(client, userId, keep = []) {
    if (!keep.length) {
        await query(client.mysqldiscord, "DELETE FROM `rankRoleGrant` WHERE `user` = ?", [userId]);
        return;
    }
    let holes = keep.map(() => "?").join(", ");
    await query(client.mysqldiscord,
        "DELETE FROM `rankRoleGrant` WHERE `user` = ? AND `role` NOT IN (" + holes + ")", [userId].concat(keep));
}

//Always resolves the member on the main server: +link is usable from the staff server and
//from any other guild the bot sits in, where message.member would be the wrong member.
//Reports what failed, because forgetting a role that is still worn strands it for good.
async function removeRoles(client, userId, roleIds, reason) {
    let member = await mainMember(client, userId);
    if (!member) return {removed: [], failed: []};

    let removed = [];
    let failed = [];
    for (const roleId of roleIds) {
        if (!roleId || !member.roles.cache.has(roleId)) continue;
        try {
            await member.roles.remove(roleId, reason);
            removed.push(roleId);
        } catch (err) {
            failed.push(roleId);
            console.error("Retrait du role " + roleId + " impossible pour " + userId + " : " + err);
            log(client, "Impossible de retirer le role " + roleId + " a <@" + userId + "> : " + err);
        }
    }
    return {removed: removed, failed: failed};
}

/* ------------------------------------------------------------------ *
 * Unlinking
 * ------------------------------------------------------------------ */

//Called from +link remove, where the account really was linked a second ago. The five
//config.ranks roles all come from the link, so all five go.
async function onUnlink(client, userId) {
    let roles = await removeRoles(client, userId, rankRoleIds(), "Compte de jeu delie");
    await quiet(forgetRoles(client, userId, roles.failed), "Nettoyage du registre de roles de " + userId);
    await quiet(query(client.mysqldiscord, "DELETE FROM `tempRank` WHERE `user` = ?", [userId]),
        "Nettoyage de tempRank pour " + userId);

    let booster = await quiet(revokeBooster(client, userId, "Compte de jeu delie"), "Retrait du grade booster de " + userId);

    if (roles.removed.length) {
        log(client, "<@" + userId + "> s'est delie, " + roles.removed.length + " role(s) de grade retire(s)");
    }
    return {roles: roles.removed, failed: roles.failed, booster: booster};
}

/* ------------------------------------------------------------------ *
 * Booster rank in game
 * ------------------------------------------------------------------ */

async function boosterRow(client, userId) {
    let rows = await query(client.mysqldiscord, "SELECT * FROM `boosterRank` WHERE `user` = ?", [userId]);
    return rows && rows[0] ? rows[0] : null;
}

//MiniCore writes temp_rank through libasynql, so the row lands a moment after the command
async function waitForTempRank(client, player, rank) {
    for (let i = 0; i < APPLY_TRIES; i++) {
        await wait(APPLY_DELAY);
        let row = await tempRankRow(client, player);
        if (row && row.new === rank) return row;
    }
    return null;
}

//Grants the rank, once. Never called when a boosterRank row already exists.
async function grantBooster(client, member, options = {}) {
    let conf = boosterConf();
    if (!boosterEnabled()) return "disabled";

    let player = options.player !== undefined ? options.player : await linkedPlayer(client, member.id);
    if (!player) {
        if (options.notify) {
            notifyOnce(member, "Merci pour ton boost !\nPour recevoir le grade " + conf.rank + " en jeu, il faut d'abord relier ton compte : tape `/link` en jeu, puis `"
                + config.prefix + "link <code>` sur le Discord. Le grade te sera donne automatiquement.");
        }
        return "unlinked";
    }

    //One temporary rank per player, and giving a second one destroys the first: a shop
    //purchase in flight must never be overwritten by a boost.
    let temp = await tempRankRow(client, player);
    if (temp) {
        if (options.notify) {
            notifyOnce(member, "Merci pour ton boost !\nTu as deja un grade temporaire en cours (" + temp.new + "), il n'a pas ete remplace. Le grade "
                + conf.rank + " te sera donne automatiquement des qu'il sera termine.");
        }
        return "temp-busy";
    }

    //There is no rank ordering anywhere in the game, so the list of ranks that may be
    //replaced is written in config. An unknown rank is not in the list, so it is kept.
    let current = await inGameRank(client, player);
    let eligible = Array.isArray(conf.eligibleRanks) ? conf.eligibleRanks : [];
    if (!eligible.includes(current)) {
        if (options.notify) {
            notifyOnce(member, "Merci pour ton boost !\nTon grade actuel en jeu (" + current + ") est meilleur que " + conf.rank
                + ", il n'a donc pas ete remplace. Tu gardes tout ce que tu avais.");
        }
        return "better-rank";
    }

    let result = await rconFirst(client, "temprank " + player + " " + conf.rank + " " + conf.days + "d");
    if (!result) {
        log(client, "Grade " + conf.rank + " impossible a donner a " + player + " (<@" + member.id + ">) : aucun serveur RCON n'a repondu");
        return "rcon-down";
    }

    //ranks.yml is read from the server, not from this repo, so the rank may simply not
    //exist there. The written row is the only proof the grant landed.
    let row = await waitForTempRank(client, player, conf.rank);
    if (!row) {
        log(client, "Grade " + conf.rank + " demande pour " + player + " (<@" + member.id + ">) mais aucune ligne temp_rank n'est apparue. Reponse du serveur : "
            + (result.output || "aucune"));
        return "not-applied";
    }

    await query(client.mysqldiscord,
        "INSERT INTO `boosterRank` (`user`, `player`, `old_rank`, `granted_at`, `expire`) VALUES (?, ?, ?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE `player` = VALUES(`player`), `old_rank` = VALUES(`old_rank`), `expire` = VALUES(`expire`)",
        [member.id, player, row.old || defaultRank(), nowSeconds(), row.expire]);

    await rconBroadcast(client, "setrank " + player + " " + conf.rank, result.port);

    //He may hear about a refusal again if he loses the rank and boosts again later
    notified.delete(member.id);
    if (options.notify) {
        notify(member, "Merci pour ton boost !\nTu as recu le grade " + conf.rank + " en jeu sur " + player
            + ". Il te reste tant que tu boostes le serveur, et tu retrouveras ton grade precedent (" + (row.old || defaultRank()) + ") en le retirant.");
    }
    log(client, "Grade " + conf.rank + " donne a " + player + " (<@" + member.id + ">) pour un boost");
    return "granted";
}

//Sliding window. Re-running temprank with the same rank ADDS the remaining time instead of
//replacing it, so a renewal has to be an absolute write.
async function renewBooster(client, row, known) {
    let conf = boosterConf();
    if (!boosterConfigured()) return "not-configured";

    let player = known !== undefined ? known : await linkedPlayer(client, row.user);
    if (!player) player = row.player;

    let expire = nowSeconds() + conf.days * DAY;
    let result = await query(client.mysqlingame,
        "UPDATE `temp_rank` SET `expire` = ? WHERE `player` = ? AND `new` = ?", [expire, player, conf.rank]);

    //Row gone (already expired and consumed at a login, wiped by datam) or replaced by
    //another temporary rank: our bookkeeping is stale, drop it and let the caller retry.
    if (!result || result.affectedRows === 0) {
        //The discord account may have moved to another minecraft name. Our row is then still
        //standing on the old one, and MiniCore reads it as an order to demote that account at
        //its next login, which would wipe anything bought since. Undo it before letting go.
        if (player !== row.player) await releaseTempRank(client, row.player, row.old_rank || defaultRank());

        await query(client.mysqldiscord, "DELETE FROM `boosterRank` WHERE `user` = ?", [row.user]);
        return "regrant";
    }

    await query(client.mysqldiscord, "UPDATE `boosterRank` SET `player` = ?, `expire` = ? WHERE `user` = ?",
        [player, expire, row.user]);
    return "renewed";
}

//Single entry point: renews what exists, grants what does not.
//options.row and options.player let the reconciliation pass hand over what it already read,
//instead of asking again once per member. Undefined means "not handed over", null means
//"handed over, and there is none".
async function ensureBooster(client, member, options = {}) {
    if (!boosterEnabled()) return "disabled";

    let row = options.row !== undefined ? options.row : await boosterRow(client, member.id);
    if (row) {
        let outcome = await renewBooster(client, row, options.player);
        if (outcome !== "regrant") return outcome;
    }
    return grantBooster(client, member, options);
}

//Undoes our own temporary rank on one minecraft account. Shared by the revoke path and by
//the renewal that discovers its account changed.
async function releaseTempRank(client, player, back) {
    let conf = boosterConf();
    let current = await inGameRank(client, player);

    if (current !== conf.rank) {
        //Someone else moved his rank in the meantime. Leave it alone, but drop our row so
        //MiniCore does not undo their change at the next login.
        await query(client.mysqlingame, "DELETE FROM `temp_rank` WHERE `player` = ? AND `new` = ?", [player, conf.rank]);
        return "superseded";
    }

    //Safety net first: an expired row makes MiniCore itself restore the rank at the next
    //login, whatever happens to the RCON call below.
    await query(client.mysqlingame, "UPDATE `temp_rank` SET `expire` = ? WHERE `player` = ? AND `new` = ?",
        [nowSeconds() - 1, player, conf.rank]);

    let result = await rconFirst(client, "setrank " + player + " " + back);
    if (!result) return "deferred";

    await query(client.mysqlingame, "DELETE FROM `temp_rank` WHERE `player` = ? AND `new` = ?", [player, conf.rank]);
    await rconBroadcast(client, "setrank " + player + " " + back, result.port);
    return "restored";
}

//Reads what the bot posted itself, never the rank the player is wearing
async function revokeBooster(client, userId, reason) {
    let conf = boosterConf();
    if (!boosterConfigured()) return "not-configured";

    let row = await boosterRow(client, userId);
    if (!row) return "nothing";

    //The account we actually granted to, NOT whatever is linked right now: after an account
    //change those differ, and acting on the new one would strip a rank we never posted.
    let player = row.player;
    let outcome = await releaseTempRank(client, player, row.old_rank || defaultRank());

    await query(client.mysqldiscord, "DELETE FROM `boosterRank` WHERE `user` = ?", [userId]);
    notified.delete(userId);
    log(client, "Grade " + conf.rank + " retire a " + player + " (<@" + userId + ">) : " + reason + " [" + outcome + "]");
    return outcome;
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

async function onBoostStart(client, member) {
    if (!boosterEnabled()) return;
    if (member.guild.id !== config.serverId) return;
    await quiet(ensureBooster(client, member, {notify: true}), "Grade booster pour " + member.id);
}

async function onBoostEnd(client, member) {
    if (!boosterConfigured()) return;
    if (member.guild.id !== config.serverId) return;
    await quiet(revokeBooster(client, member.id, "Fin du boost"), "Retrait du grade booster de " + member.id);
}

//Called right after a successful +link, so a booster who linked late gets his rank
async function onLink(client, userId) {
    if (!boosterEnabled()) return;
    let member = await mainMember(client, userId);
    if (!member || !member.premiumSince) return;
    await quiet(ensureBooster(client, member, {notify: true}), "Grade booster pour " + userId);
}

/* ------------------------------------------------------------------ *
 * Reconciliation
 * ------------------------------------------------------------------ */

//Catches everything the events cannot see: a boost started or dropped while the bot was
//down, a member who left, and the two unlink paths the bot is never told about
//(/link remove in game, and the staff datam command).
async function sweep(client) {
    let guild = client.guilds.cache.get(config.serverId);
    if (!guild) return console.log("Passe de reconciliation : serveur principal introuvable");

    let members;
    try {
        members = await guild.members.fetch();
    } catch (err) {
        return console.error("Passe de reconciliation : impossible de recuperer les membres : " + err);
    }

    //One read of the link table for the whole pass, instead of one per registered member.
    //It is only a shortcut: both destructive branches confirm live before acting, so losing
    //it costs speed, never correctness, and must not cancel the pass.
    let links = await quiet(loadLinks(client), "Passe de reconciliation : lecture des liaisons");
    if (!links) links = new Map();

    await quiet(sweepRoles(client, links), "Passe de reconciliation des roles");
    await quiet(sweepBoosters(client, members, links), "Passe de reconciliation des boosters");
}

//Only touches roles the bot recorded posting itself, so a rank offered by hand is safe
async function sweepRoles(client, links) {
    let rows = await query(client.mysqldiscord, "SELECT DISTINCT `user` FROM `rankRoleGrant`");
    if (!rows) return;

    for (const row of rows) {
        try {
            if (links.has(row.user)) continue;
            //The snapshot is a few seconds old and what follows takes roles away, so the
            //rare member it points at is confirmed live first. Costs one query per member
            //actually concerned, not one per member in the register.
            if (await linkedPlayer(client, row.user)) continue;

            let granted = await grantedRoles(client, row.user);
            let roles = await removeRoles(client, row.user, granted, "Compte de jeu delie");
            await forgetRoles(client, row.user, roles.failed);
            await quiet(query(client.mysqldiscord, "DELETE FROM `tempRank` WHERE `user` = ?", [row.user]),
                "Nettoyage de tempRank pour " + row.user);

            if (roles.removed.length) {
                log(client, "<@" + row.user + "> n'est plus lie a un compte de jeu, " + roles.removed.length + " role(s) de grade retire(s)");
            }
        } catch (err) {
            console.error("Reconciliation des roles de " + row.user + " : " + err);
        }
    }
}

//Sequential on purpose: MiniCore reads temp_rank before writing it, outside its own
//callback, so two concurrent rank commands on the same player race each other.
async function sweepBoosters(client, members, links) {
    let rows = await query(client.mysqldiscord, "SELECT * FROM `boosterRank`");

    //The whole table, so an absent key means "no grant", not "not looked up yet"
    let granted = new Map();
    if (rows) for (const row of rows) granted.set(row.user, row);

    for (const row of rows || []) {
        try {
            let member = members.get(row.user);
            let reason = null;

            if (!member) reason = "Membre parti du serveur";
            else if (!member.premiumSince) reason = "Fin du boost";
            //Still boosting is not enough. The account may have unlinked in game, which the
            //bot is never told about, and the sibling pass above has already taken his
            //discord roles back for exactly that reason.
            //Same as above: confirmed live, because this one takes a rank away
            else if (!links.has(row.user) && !await linkedPlayer(client, row.user)) reason = "Compte de jeu delie";

            if (!reason) continue;
            await revokeBooster(client, row.user, reason);
            granted.delete(row.user);
        } catch (err) {
            console.error("Retrait du grade booster de " + row.user + " : " + err);
        }
    }

    if (!boosterEnabled()) return;

    for (const member of members.values()) {
        if (!member.premiumSince) continue;
        try {
            await ensureBooster(client, member, {
                notify: false,
                row: granted.has(member.id) ? granted.get(member.id) : null,
                player: links.has(member.id) ? links.get(member.id) : null
            });
        } catch (err) {
            console.error("Grade booster pour " + member.id + " : " + err);
        }
    }
}

/* ------------------------------------------------------------------ *
 * Startup
 * ------------------------------------------------------------------ */

//ready can fire again after a reconnection, so the interval is installed only once
async function start(client) {
    if (sweepTimer) return;

    let ready = await quiet(ensureTables(client), "Creation des tables du module de liaison");
    if (ready === null) return console.error("Module de liaison desactive : les tables n'ont pas pu etre creees");

    let minutes = Number.isInteger(boosterConf().sweepMinutes) && boosterConf().sweepMinutes > 0
        ? boosterConf().sweepMinutes : 60;

    sweepTimer = setInterval(() => {
        quiet(sweep(client), "Passe de reconciliation");
    }, minutes * 60 * 1000);

    await quiet(sweep(client), "Passe de reconciliation");
}

module.exports = {
    start: start,
    sweep: sweep,
    onUnlink: onUnlink,
    onLink: onLink,
    onBoostStart: onBoostStart,
    onBoostEnd: onBoostEnd,
    ensureBooster: ensureBooster,
    revokeBooster: revokeBooster,
    rememberRole: rememberRole,
    rankRoleIds: rankRoleIds,
    mainMember: mainMember,
    query: query
};
