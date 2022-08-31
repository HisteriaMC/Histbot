const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.");
    try {
        let member = message.mentions.members.first() || await client.users.fetch(args[0]);
        if (!member) return message.reply("L'utilisateur mentionné n'est pas valide");

        await message.channel.permissionOverwrites.edit(member.id, {
            ViewChannel: false,
            SendMessages: false
        }, "Supressin d'utilisateur dans un ticket");

        message.reply("<@" + member.id + "> a bien été supprimé du ticket");
    } catch (e) {
        message.reply("L'utilisateur mentionné n'est pas valide")
    }
};

module.exports.config = {
    name: "removeuser",
    description: "Supprimer un utilisateur d'un ticket",
    format: "removeuser <user>",
    alias: ["remove", "removeusr", "deleteuser", "delete", "deleteusr"],
    canBeUseByBot: false,
    category: "Ticket",
    bypassChannel: true
};
