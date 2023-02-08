const config = require('../../config.json');
const hidden = require('../../hidden.json');
const fetch = (...args) => import('node-fetch').then(module => module.default(...args))

const RATE = 200;
module.exports.run = async(client, message) => {
    let rep = await fetch(`https://minecraftpocket-servers.com/api/?object=servers&element=detail&key=${hidden.mcpeToken}`).then(response => response.json());
    if (!rep["votes"] || isNaN(rep["votes"])) return message.reply("Erreur 1 !");
    let votes = parseInt(rep["votes"]);

    let nextExecute = Math.ceil((votes + 1) / RATE) * RATE;
    message.reply({
        embeds: [{
            title: `Informations du vote party`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria "+new Date().getFullYear()
            },
            fields: [
                {
                    name: "Votes totaux",
                    value: votes,
                    inline: true
                },
                {
                    name: "Votes manquants",
                    value: nextExecute - votes,
                    inline: true
                },
                {
                    name: "Pourcentage actuel",
                    value: `${Math.round(((RATE - (nextExecute - votes)) / RATE * 100) * 100) / 100}%`,
                    inline: true
                }
            ]
        }]
    })
};
module.exports.config = {
    name: "voteparty",
    description: "Informations sur le party vote",
    format: "voteparty",
    alias: ["partyvote"],
    canBeUseByBot: true,
    category: "In Game",
    needed_args: 0
};
