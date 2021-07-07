const config = require('../../config.json');
const moment = require('moment');

module.exports.run = async(client, message, args) => {
    if(!args[0]) return message.reply("Il manque la personne a vérifié");
    client.mysqlminicore.query("SELECT * FROM `banPlayers` WHERE player = ?", [args[0]], function (err, results){
        if(err) {
            console.error(err);
            message.reply("Erreur");
        }

        if(!results || !results[0]) return message.reply("Aucun membre banni avec ce pseudo");
        let result = results[0];

        message.reply({
            embed: {
                title: `Information du ban de **${result.player}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.image_url,
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
                        value: moment.unix(result.banTime).format("LLL") +` (${moment.unix(result.banTime).fromNow()})`
                    }
                ]
            }
        })
    })
};

module.exports.config = {
    name: "tcheck",
    description: "Voir les informations d'un joueur banni",
    format: "+tcheck <pseudo>",
    canBeUseByBot: false,
    category: "In Game"
};
