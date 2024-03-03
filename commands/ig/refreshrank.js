const config = require('../../config.json');

module.exports.run = async(client, message) => {
    let link = client.commands.get("link");
    let username = await link.parseArg(null, message, client.mysqlingame);
    if (!username) return; //error message already thrown

    client.mysqlingame.query("SELECT * FROM `permsPlayers` WHERE player = ?", [username], async function (err, results) {
        if (err) {
            console.error(err);
            message.reply("Erreur");
        }

        if (!results || !results[0]) return message.reply("Aucun joueur trouvé avec ce pseudo");
        let result = results[0];

        let rank = result.rank;
        let permissions = result.perms.split(",");

        if (permissions.includes("utility.prefix")) {
            await message.member.roles.add(config.ranks.OmegaPerso, "Refresh rank");
            message.reply("Vous avez reçu le grade Omega Perso");
        }

        let discordRank = config.ranks[rank];
        if (!discordRank) return message.reply("Erreur: Rank non trouvé");

        await message.member.roles.add(discordRank, "Refresh rank");
        message.reply(`Vous avez reçu le grade ${rank}`);

        client.mysqlingame.query("SELECT * FROM `tempRank` WHERE player = ?", [username],
            function (err, results) {
            if (err) {
                console.error(err);
                message.reply("Erreur");
            }

            if (!results || !results[0]) return;
            let result = results[0];

            client.mysqldiscord.query("INSERT INTO `tempRank` (user, rank, timestamp) VALUES (?, ?, ?)",
                [message.author.id, result.new, result.expire]);
        });
    })
};

//Check every hour if a player has a rank that should be removed
module.exports.update = async(client) => {
    client.mysqldiscord.query("SELECT * FROM `tempRank` WHERE timestamp < ?", [new Date().getTime() / 1000],
        function (err, results) {
        if (err) {
            console.error(err);
            return;
        }

        //Loop over results and remove the rank
        results.forEach(result => {
            //Fetch member
            client.guilds.cache.get(config.serverId).members.fetch(result.user).then(member => {
                console.log("Remove rank for " + member.user.username + " (" + member.user.id + ")");
                member.roles.remove(config.ranks[result.rank], "Fin de la période de rank");
                if (result.rank === "Omega") member.roles.remove(config.ranks.OmegaPerso, "Fin de la période de rank");
                client.mysqldiscord.query("DELETE FROM `tempRank` WHERE user = ?", [result.user]);
            }).catch(err => {
                console.error("Impossible de fetch le membre " + result.user);
                console.error(err);
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
