const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.")

    try {
        let member = message.mentions.members.first() || await client.users.fetch(args[0]);
        if (!member) return message.reply("L'utilisateur mentionné n'est pas valide");

        await message.channel.permissionOverwrites.edit(member.id, {
            VIEW_CHANNEL: true,
            SendMessages: true
        }, "Ajout d'utilisateur dans un ticket");

        message.reply("<@" + member.id + "> a bien été rajouté au ticket");
    } catch (e) {
        message.reply("L'utilisateur mentionné n'est pas valide")
    }
};

module.exports.config = {
    name: "adduser",
    description: "Ajouter un utilisateur à un ticket",
    format: "adduser <user>",
    alias: ["add", "addusr"],
    canBeUseByBot: false,
    category: "Ticket",
    needed_args: 1,
    bypassChannel: true
};
