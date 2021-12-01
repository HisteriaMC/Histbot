const config = require("../../config.json");

module.exports.run = async(client, message) => {
    const d = new Date();
    message.channel.send({
        embeds: [{
            title: `**__Boutique__**`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria " + d.getFullYear()
            },
            fields: [
                {
                    name: "Lien boutique",
                    value: "https://shop.histeria.fr"
                }
            ],
        }]
    });
};

module.exports.config = {
    name: "boutique",
    description: "La boutique du serveur",
    format: "boutique",
    canBeUseByBot: true,
    category: "Informations",
    alias: ["shop", "store"],
    delete: true
};
