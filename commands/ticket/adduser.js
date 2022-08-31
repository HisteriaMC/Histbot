const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");
const {User} = require("discord.js");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.")

    try {
        let member = message.mentions.users.first();
        if(!member && args[0]) member = message.guild.members.cache.get(args[0]);
        if(!member) return message.reply("Utilisateur introuvable.");
        if(member instanceof User) member = message.guild.members.cache.get(member.id);

        await message.channel.permissionOverwrites.edit(member.id, {
            ViewChannel: true,
            SendMessages: true
        });

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
