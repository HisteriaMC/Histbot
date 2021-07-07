const config = require("../../config.json");

module.exports.run = async(client, message) => {
    const d = new Date();
    message.delete().catch(()=>{});

    let port = message.guild.id === config.serverid ? "19132" : "25565";

    await message.channel.send({
        embed: {
            title: `**__Info du serveur__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.image_url,
                text: "@Histeria "+d.getFullYear()
            },
            fields: [
                {
                    name: "IP",
                    value: "histeria.fr"
                },
                {
                    name: `Port`,
                    value: port
                }
            ],
        }
    });
};

module.exports.config = {
    name: "ip",
    description: "IP du serveur",
    format: "+ip",
    canBeUseByBot: true,
    category: "Informations"
};
