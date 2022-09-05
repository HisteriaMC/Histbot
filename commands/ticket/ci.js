const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.channel.send("Cette commande est à exécuter dans un ticket.");

    let topic = message.channel.topic;
    if(!topic) topic = "";
    let splitted = topic.split('@').pop();
    splitted = splitted.split('>').shift();
    let user = client.users.fetch(splitted).catch( () => console.error("Erreur lors du get de l'utilisateur qui demande ci"));

    if (["oui", "yes", "ouai", "oué", "oue", "ui", "true", "o"].includes(args[1])) {
        if(splitted !== "") splitted = "<@!"+splitted+">";
        message.channel.send({
            content: splitted,
            embeds: [{
                title: `**__Fermeture du ticket, inactivité ?__**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria " + new Date().getFullYear()
                },
                fields: [
                    {
                        name: "Inactivité !",
                        value: "\nCela fait maintenant un bon bout de temps que vous n'avez pas parlé, si vous n'avez plus de problème veuillez fermer le ticket avec **+close** !\n\nCordialement, \nLe staff de Histeria"
                    }
                ],
            }]
        });
        user.then(member => {
            member.send({
                embeds: [{
                    title: `**__Fermeture du ticket, inactivité ?__**`,
                    color: config.color,
                    timestamp: new Date(),
                    footer: {
                        icon_url: config.imageURL,
                        text: "@Histeria " + new Date().getFullYear()
                    },
                    fields: [
                        {
                            name: "Inactivité !",
                            value: "\nCela fait maintenant un bon bout de temps que vous n'avez pas parlé dans le ticket <#"+message.channel.id+
                                ">, si vous n'avez plus de problème veuillez fermer le ticket avec **+close** !\n\nCordialement, \nLe staff de Histeria"
                        }
                    ],
                }]
            }).catch(() => console.log("Impossible de dm le closeur d'un ticket"));
        })
    } else {
        if(splitted !== "") splitted = "<@!"+splitted+">";
        message.channel.send({
            content: splitted,
            embeds: [{
                title: `**__Fermeture du ticket ?__**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria " + new Date().getFullYear()
                },
                fields: [
                    {
                        name: "Avez vous eu votre réponse ?",
                        value: "\nSi tu as eu ta réponse à ta question tu peux fermer le ticket avec **+close** !\n\nCordialement, \nLe staff de Histeria"
                    }
                ],
            }]
        });
        user.then(member => {
            if(!member) return;
            member.send({
                embeds: [{
                    title: `**__Fermeture du ticket ?__**`,
                    color: config.color,
                    timestamp: new Date(),
                    footer: {
                        icon_url: config.imageURL,
                        text: "@Histeria " + new Date().getFullYear()
                    },
                    fields: [
                        {
                            name: "Avez vous eu votre réponse ?",
                            value: "\nSi tu as eu ta réponse à ta question dans le ticket <#" +
                                message.channel.id + "> tu peux fermer le ticket avec **+close** !\n\nCordialement, \nLe staff de Histeria"
                        }
                    ],
                }]
            }).catch(() => console.log("Impossible de dm le closeur d'un ticket"));
        });
    }
    if(args[0] === undefined || (args[0] !== null && ["oui", "yes", "ouai", "oué", "oue", "ui", "true"].includes(args[0]))) {
        let categoryid = config.tickets.categoryClosed;
        await message.channel.setParent(categoryid, { lockPermissions: false });
        //await message.channel.setTopic(message.channel.topic+" fermé par "+message.author.displayName);
    }
};

module.exports.config = {
    name: "ci",
    description: "Indique comment fermer un ticket proprement",
    format: "ci [deplace_in_category] [force]",
    alias: ["fci", "closteit", "forcecloseit"],
    canBeUseByBot: false,
    category: "Ticket",
    delete: true,
    bypassChannel: true
};
