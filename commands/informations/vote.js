const config = require("../../config.json");
const fetch = require("node-fetch");

module.exports.run = async(client, message) => {
    const d = new Date();
    message.delete().catch(() => {});
    let server = message.guild.id === config.serverid ? "java" : "bedrock";

    if(server === "java"){
        message.reply({embed : {
                color: config.color,
                title: "**__VOTE__**",
                url: "https://serveur-prive.net/minecraft/histeria-7438/vote",
                timestamp: new Date(),
                footer: {
                    "icon_url": config.image_url,
                    "text": "@Histeria "+d.getFullYear()
                },
                fields: [
                    {
                        "name": "Vote",
                        "value": "Tu peux __[voter ici](https://serveur-prive.net/minecraft/histeria-7438/vote)__, Merci !"
                    }
                ]
            }
        });
    } else {
        const file = await fetch('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key='+config.mcpetoken).then(response => response.json());
        const filefinal = Object.values(file);

        message.reply({embed : {
                color: config.color,
                title: "**__VOTE__**",
                url: "https://bit.ly/histeriavote",
                timestamp: new Date(),
                footer: {
                    "icon_url": config.image_url,
                    "text": "@Histeria "+d.getFullYear()
                },
                fields: [
                    {
                        "name": "Vote",
                        "value": "Tu peux __[voter ici](https://bit.ly/histeriavote)__, Merci !"
                    },
                    {
                        "name": "Statistiques",
                        "value": `Votes ce mois : ${filefinal[16]}\nRank mondial : ${filefinal[15]}\nJoueurs connectés (à ${d.getHours()}h${d.getMinutes()}m) : ${filefinal[9]}`
                    }
                ]
            }
        });
    }

};

module.exports.config = {
    name: "vote",
    description: "Lien du site de vote",
    format: "+vote",
    category: "Informations",
    canBeUseByBot: true
};
