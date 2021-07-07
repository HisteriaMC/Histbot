const mcutil = require('minecraft-server-util');
const config = require("../../config.json");

module.exports.run = async(client, message) => {
    let server = message.guild.id === config.serverid ? "Java" : "Bedrock";
    let port = message.guild.id === config.serverid ? 25565 : 19132;
    mcutil.queryFull('histeria.fr', {port: port, enableSRV: true, timeout: 5000})
        .then((response) => {
            let clean = getCleanPlayers(response.players);
            let d = new Date();
            switch(clean.type){
                case "message":
                    message.channel.send(`Voici la liste de tout les joueurs connectés sur le serveur ${server} (${response.onlinePlayers}/${response.maxPlayers})`);
                    clean.list.forEach(msg => {
                        message.channel.send(msg);
                    })
                    break;
                case "description":
                    message.channel.send({
                        embed: {
                            title: `Liste de joueurs connectés sur le serveur ${server} (${response.onlinePlayers}/${response.maxPlayers})`,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.image_url,
                                text: "@Histeria " + d.getFullYear()
                            },
                            description: clean.list[0]
                        }
                    });
                    break;
                case "fields":
                    message.channel.send({
                        embed: {
                            title: `Liste de joueurs connectés sur le serveur ${server} (${response.onlinePlayers}/${response.maxPlayers})`,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.image_url,
                                text: "@Histeria " + d.getFullYear()
                            },
                            fields: [
                                {
                                    name: "Liste",
                                    value: clean.list[0]
                                }
                            ]
                        }
                    });
                    break;
            }
        })
        .catch((error) => {
            message.reply("Erreur lors de la récupération du statut, serveur hors ligne ? `" + error + "`");
        });
};
function getCleanPlayers(players)
{
    if(players.length === 0) return {type: "message", list: ["Aucun joueur"]}
    let cleanlist = [];
    let stringplayers = "";
    let stringlist = players.join(", ");
    let type;
    if(stringlist.length < 1024) type = "fields";
    else if(stringlist.length < 1984) type = "description"; //En réalité 2048
    else type = "message";

    players.forEach(player => {
        if(stringplayers.length > 1984){
            cleanlist.push(stringplayers.substr(0, stringplayers.length -2));
            stringplayers = "";
        }
        stringplayers = stringplayers.concat(player+", ");
    });
    cleanlist.push(stringplayers.substr(0, stringplayers.length -2));
    return {type: type, list: cleanlist};
}
module.exports.config = {
    name: "list",
    description: "Liste des joueurs en jeu",
    format: "+list",
    alias: ["listbedrock", "listplots", "listjava"],
    category: "Informations",
    canBeUseByBot: true
};
