const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");

module.exports.run = async(client, message) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.channel.send("Cette commande est à exécuter dans un ticket.");
    message.channel.messages.fetch({ limit: 10 }).then(messages => {
        messages.forEach(base => {
            try{
                if(base.embeds[0].title === "**__Nouveau Ticket__**"){
                    base.edit({
                        embed: {
                            title: `**__Nouveau Ticket__**`,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.imageURL,
                                text: "@Histeria " + new Date().getFullYear()
                            },
                            fields: [
                                {
                                    name: "Sujet du ticket",
                                    value: "Skipped"
                                },
                                {
                                    name: "Pseudo in game",
                                    value: "Skipped"
                                },
                                {
                                    name: "Description approfondie",
                                    value: "Skipped"
                                }
                            ],
                        }
                    });
                }
                base.reactions.removeAll();
                let categoryid = config.tickets.categoryOpened;

                let topic = message.channel.topic;
                if(!topic) topic = "";
                let splitted = topic.split('@').pop();
                splitted = splitted.split('>').shift();
                message.channel.setTopic("Ticket ouvert pour skip par <@" + (splitted ?? message.author.id) + "> (skip)");
                message.channel.setParent(categoryid, { lockPermissions: false });
            }catch(e){}
        })
    });
};

module.exports.config = {
    name: "skip",
    description: "Sauter toutes les étapes de la création d'un ticket",
    format: "skip",
    alias: ["skipped"],
    canBeUseByBot: false,
    category: "Ticket",
    delete: true,
    bypassChannel: true
};
