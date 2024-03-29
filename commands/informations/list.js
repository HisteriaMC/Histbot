const mcutil = require('minecraft-server-util');
const config = require("../../config.json");

module.exports.run = async(client, message) => {
    mcutil.queryFull('192.168.1.42', {port: config.port, enableSRV: true, timeout: 5000})
        .then((response) => {
            let clean = getCleanPlayers(response.players);
            let d = new Date();
            const title = `Liste de joueurs connectés sur le serveur (${response.onlinePlayers}/${response.maxPlayers})`;
            switch(clean.type){
                case "message":
                    message.channel.send(title);
                    clean.list.forEach(msg => {message.channel.send(msg);});
                    break;
                case "description":
                    message.channel.send({
                        embeds: [{
                            title: title,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.imageURL,
                                text: "@Histeria " + d.getFullYear()
                            },
                            description: clean.list[0]
                        }]
                    });
                    break;
                case "fields":
                    message.channel.send({
                        embeds: [{
                            title: title,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.imageURL,
                                text: "@Histeria " + d.getFullYear()
                            },
                            fields: [
                                {
                                    name: "Liste",
                                    value: clean.list[0]
                                }
                            ]
                        }]
                    });
                    break;
            }
        }).catch((error) => {
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
    description: "Donne la liste des joueurs connectés au serveur",
    format: "list",
    category: "Informations",
    canBeUseByBot: true,
    delete: true
};
