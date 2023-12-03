const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    let link = client.commands.get("link");
    let username = await link.parseArg(args[0], message, client.mysqlingame);

    client.mysqlingame.query("SELECT * FROM `ban` WHERE player = ?", [username], function (err, results){
        if(err) {
            console.error(err);
            message.reply("Erreur");
        }

        if(!results || !results[0]) return message.reply("Aucun membre banni avec ce pseudo");
        let result = results[0];

        message.reply({
            embeds: [{
                title: `Information du ban de **${result.player}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria "+new Date().getFullYear()
                },
                fields: [
                    {
                        name: "Joueur banni",
                        value: result.player
                    },
                    {
                        name: "Raison",
                        value: result.reason
                    },
                    {
                        name: "Staff",
                        value: result.staff
                    },
                    {
                        name: "Fin du ban le",
                        value: String('<t:'+result.time+':F> (<t:'+result.time+':R>)')
                    }
                ]
            }]
        })
    })
};

module.exports.config = {
    name: "tcheck",
    description: "Voir les informations d'un joueur banni",
    format: "tcheck [pseudo]",
    canBeUseByBot: false,
    category: "In Game",
    needed_args: 0,
    iglink: true,
    args: {pseudo: "string"}
};
