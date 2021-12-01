const config = require("../../config.json");
const hidden = require("../../hidden.json");
const fetch = (...args) => import('node-fetch').then(module => module.default(...args))

module.exports.run = async(client, message) => {
    const d = new Date();

    const file = await fetch('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key='+hidden.mcpetoken).then(response => response.json());
    const filefinal = Object.values(file);

    message.channel.send({
        embeds : [{
            color: config.color,
            title: "**__VOTE__**",
            url: "https://bit.ly/histeriavote",
            timestamp: d,
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
        }]
    });
};

module.exports.config = {
    name: "vote",
    description: "Lien du site de vote",
    format: "vote",
    category: "Informations",
    canBeUseByBot: true,
    delete: true
};
