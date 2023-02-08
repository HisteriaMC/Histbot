const config = require('../../config.json');

module.exports.run = async(client, message) => {
    let rcon = client.commands.get("rcon");

    message.reply("Chargement des informations...").then(async (msg) => {
        rcon.config.rconfunc(19101, "bosstimer raw", message, "fac1", false, function (faction1) {
            rcon.config.rconfunc(19102, "bosstimer raw", message, "fac2", false, function (faction2) {
                rcon.config.rconfunc(19103, "bosstimer raw", message, "fac3", false, function (faction3) {
                    msg.edit({
                        content: "",
                        embeds: [{
                            title: `Informations sur les temps de respawn de boss`,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.imageURL,
                                text: "@Histeria "+new Date().getFullYear()
                            },
                            fields: [
                                {
                                    name: "Boss faction 1",
                                    value: faction1,
                                    inline: true
                                },
                                {
                                    name: "Boss faction 2",
                                    value: faction2,
                                    inline: true
                                },
                                {
                                    name: "Boss faction 3",
                                    value: faction3,
                                    inline: true
                                }
                            ]
                        }]
                    })
                })
            })
        })
    });
};
module.exports.config = {
    name: "bosstimer",
    description: "Informations sur les prochains boss",
    format: "bosstimer",
    alias: ["timerboss", "boss"],
    canBeUseByBot: true,
    category: "In Game",
    needed_args: 0
};
