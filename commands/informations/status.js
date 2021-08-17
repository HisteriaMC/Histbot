const mcutil = require('minecraft-server-util');
const config = require("../../config.json");

module.exports.run = async(client, message) => {
    let server = message.guild.id === config.serverid ? "bedrock" : "java"; //WTF x2

    if(server === "java"){
        mcutil.status('histeria.fr', {port: 25565, enableSRV: true, timeout: 5000})
            .then((response) => replywithembed(server, 25565, response, message))
            .catch((error) => {
                message.reply("Erreur lors de la récupération du statut, serveur hors ligne ? `" + error + "`");
            });
    } else {
        mcutil.statusBedrock('histeria.fr', {port: 19132, enableSRV: false, timeout: 5000})
            .then((response) => replywithembed(server, 19132, response, message))
            .catch((error) => {
                message.reply("Erreur lors de la récupération du statut, serveur hors ligne ? `" + error + "`");
            });
    }
};

function replywithembed(server, port, response, message)
{
    let d = new Date();
    message.channel.send({
        embed: {
            title: `Statut du serveur ${server}`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.image_url,
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
        }
    });
}

module.exports.config = {
    name: "status",
    description: "Statut actuelle du serveur en jeu",
    format: "+status",
    alias: ["statusbedrock", "statusplots"],
    category: "Informations",
    canBeUseByBot: true
};
