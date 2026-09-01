const config = require('../../config.json');
const linkmanager = require('../../linkmanager');

module.exports.run = async(client, message, args) => {
    let link = client.commands.get("link");
    let username = await link.parseArg(null, message, client.mysqlingame);
    if (!username) return; //error message already thrown

    client.mysqlingame.query("SELECT * FROM `ranks` WHERE player = ?", [username], async function (err, results) {
        //mysql2 throws away the promise of this callback, so nothing may escape it
        try {
            if (err) {
                console.error(err);
                return message.reply("Erreur");
            }

            if (!results || !results[0]) return message.reply("Aucun joueur trouvé avec ce pseudo");
            let result = results[0];

            let rank = result.rank;
            let permissions = (result.perms || "").split(","); //perms is nullable in the game database

            let discordRank = config.ranks[rank];
            //Histerien, the staff ranks and Boosteur have no discord role: there is nothing
            //to grant, and adding an undefined role id kills the process
            if (!discordRank) {
                if (args[0] === "link") return;
                return message.reply("Erreur: Rank non trouvé");
            }

            let roles = [discordRank];
            let label = rank;
            if (permissions.includes("utility.prefix") && rank === "Omega") {
                roles.push(config.ranks.OmegaPerso);
                label = "Omega Perso";
            }

            for (const roleId of roles) {
                if (!roleId) continue;
                await message.member.roles.add(roleId, "Refresh rank");
                //Registry of what the bot posted itself, read back when the account unlinks
                await linkmanager.rememberRole(client, message.author.id, roleId, username);
            }
            message.reply(`Vous avez reçu le grade ${label}`);

            client.mysqlingame.query("SELECT * FROM `temp_rank` WHERE player = ?", [username],
                function (err, results) {
                if (err) {
                    console.error(err);
                    return message.reply("Erreur");
                }

                if (!results || !results[0]) return;
                let result = results[0];

                //One row per user: a refresh replaces the deadline instead of stacking a
                //second one next to it
                client.mysqldiscord.query("DELETE FROM `tempRank` WHERE `user` = ?", [message.author.id],
                    function (err) {
                    if (err) return console.error(err);

                    //`rank` is a reserved word since MySQL 8.0.2: unquoted, this insert is a
                    //syntax error and the row is never written
                    client.mysqldiscord.query("INSERT INTO `tempRank` (`user`, `rank`, `timestamp`) VALUES (?, ?, ?)",
                        [message.author.id, result.new, result.expire],
                        function (err) { if (err) console.error(err); });
                });
            });
        } catch (error) {
            console.error("Refresh du rank de " + username + " : " + error);
        }
    })
};

//Check every hour if a player has a rank that should be removed
module.exports.update = async(client) => {
    //update() is fired at boot right after login, before ready has filled the guild cache
    let guild = client.guilds.cache.get(config.serverId);
    if (!guild) return console.log("Expiration des ranks: serveur principal introuvable");

    client.mysqldiscord.query("SELECT * FROM `tempRank` WHERE `timestamp` < ?", [Math.floor(Date.now() / 1000)],
        function (err, results) {
        if (err) {
            console.error(err);
            return;
        }
        if (!results) return;

        //Loop over results and remove the rank
        results.forEach(result => {
            //Fetch member
            guild.members.fetch(result.user).then(async member => {
                console.log("Remove rank for " + member.user.username + " (" + member.user.id + ")");

                let roles = [config.ranks[result.rank]];
                if (result.rank === "Omega") roles.push(config.ranks.OmegaPerso);

                for (const roleId of roles) {
                    if (!roleId) continue;
                    await member.roles.remove(roleId, "Fin de la période de rank");
                }

                //Forget the row only once the roles are really gone, otherwise a transient
                //failure orphans them for good
                client.mysqldiscord.query("DELETE FROM `tempRank` WHERE `user` = ? AND `rank` = ?",
                    [result.user, result.rank], function (err) { if (err) console.error(err); });
            }).catch(err => {
                console.error("Impossible de retirer le rank de " + result.user);
                console.error(err);

                //Member gone from the server: nothing will ever act on this row again
                if (err && err.code === 10007) {
                    client.mysqldiscord.query("DELETE FROM `tempRank` WHERE `user` = ? AND `rank` = ?",
                        [result.user, result.rank], function (err) { if (err) console.error(err); });
                }
            });
        });
    });
};

module.exports.config = {
    name: "refreshrank",
    description: "Mettre à jour votre rank basé sur votre +link",
    format: "refreshrank",
    canBeUseByBot: false,
    category: "In Game",
    needed_args: 0,
    iglink: true,
    args: {player: "string"}
};
