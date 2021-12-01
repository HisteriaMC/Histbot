const mcutil = require('minecraft-server-util');
const config = require("../../config.json");

module.exports.run = async(client, message) => {
    mcutil.statusBedrock('histeria.fr', {port: config.port, enableSRV: true, timeout: 5000})
        .then((response) => replywithembed(response.port, response, message))
        .catch((error) => {
            message.channel.send("Erreur lors de la récupération du statut, serveur hors ligne ? `" + error + "`");
        });
};

function replywithembed(port, response, message)
{
    let d = new Date();
    message.channel.send({
        embeds: [{
            title: `Statut du serveur`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria " + d.getFullYear()
            },
            fields: [
                {
                    name: 'IP',
                    value: `histeria.fr ${port}`,
                    inline: false
                },
                {
                    name: 'Etat',
                    value: `En ligne`,
                    inline: false
                },
                {
                    name: 'Joueurs',
                    value: `${response["onlinePlayers"]}/${response["maxPlayers"]}`,
                    inline: false
                },
                {
                    name: 'Version',
                    value: `${response["version"]}`
                }
            ]
        }]
    });
}

module.exports.config = {
    name: "status",
    description: "Statut actuel du serveur en jeu",
    format: "status",
    category: "Informations",
    canBeUseByBot: true,
    delete: true
};
