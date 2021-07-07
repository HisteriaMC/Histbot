const config = require("../../config.json");

module.exports.run = async(client, message) => {
    const d = new Date();
    message.delete().catch(()=>{});
    await message.channel.send({
        embed: {
            title: `**__Boutique__**`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.image_url,
                text: "@Histeria "+d.getFullYear()
            },
            fields: [
                {
                    name: "Lien boutique",
                    value: "https://shop.histeria.fr"
                }
            ],
        }
    });
};

module.exports.config = {
    name: "boutique",
    description: "La boutique du serveur",
    format: "+boutique",
    canBeUseByBot: true,
    category: "Informations",
    alias: ["shop", "store"]
};
