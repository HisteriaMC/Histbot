const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");
const {User} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.")

    try {
        role = message.guild.roles.cache.get(config["tickets"]["roles"]["guide"]) // Returns <Role> object
        await message.channel.permissionOverwrites.edit(role.id, {
            ViewChannel: false,
            SendMessages: false
        });
        message.reply("Le ticket a bien été passé en modo only !");
    } catch (e) {
        message.reply("Erreur : " + e)
    }
};

module.exports.config = {
    name: "modoonly",
    description: "Retire l'acces au ticket aux guides",
    format: "modoonly",
    alias: ["modoonly"],
    canBeUseByBot: false,
    category: "Ticket",
    needed_args: 0,
    bypassChannel: true,
    permission: PermissionFlagsBits.ManageMessages
};
