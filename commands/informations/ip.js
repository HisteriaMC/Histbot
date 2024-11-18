const config = require("../../config.json");

module.exports.run = async(client, message) => {
    const d = new Date();
    message.channel.send({
        embeds: [{
            title: `**__Info du serveur__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria "+d.getFullYear()
            },
            fields: [
                {
                    name: "IP",
                    value: "histeria.fr"
                },
                {
                    name: "Port",
                    value: String(config.port)
                }
            ],
        }]
    });
};

module.exports.config = {
    name: "ip",
    description: "IP du serveur",
    format: "ip",
    canBeUseByBot: true,
    category: "Informations",
    delete: true,
    bypassChannel: true
};
