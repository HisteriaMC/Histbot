const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.")

    let rolesToRestrict = [];
    let rolesToAllow = [];
    switch (args[0]) {
        case "admin":
        case "admins":
            //restrict guides & mods
            rolesToRestrict.push(config.tickets.roles.guide);
            rolesToRestrict.push(config.tickets.roles.moderateur);
            rolesToRestrict.push(config.tickets.roles.staff);
        break;

        case "mod":
        case "mods":
        case "modo":
        case "modos":
            //restrict guides
            rolesToRestrict.push(config.tickets.roles.guide);
            rolesToRestrict.push(config.tickets.roles.staff);
            //allow mods
            rolesToAllow.push(config.tickets.roles.moderateur);
        break;

        case "guide":
        case "guides":
        case "all":
        case "seeall":
        case "none":
            //restrict no one
            rolesToAllow.push(config.tickets.roles.staff);
        break;

        default:
            return message.reply("Argument invalide. Les arguments possibles sont : `admin`, `mods`, `none`.");
    }

    let restrictId = 0;
    let allowId = 0;
    try {
        if (rolesToRestrict.length > 0) {
            for (let i = 0; i < rolesToRestrict.length; i++) {
                restrictId = rolesToRestrict[i];
                await message.channel.permissionOverwrites.edit(rolesToRestrict[i], {
                    SendMessages: false,
                    ViewChannel: false
                });
            }
        }

        if (rolesToAllow.length > 0) {
            for (let i = 0; i < rolesToAllow.length; i++) {
                allowId = rolesToAllow[i];
                await message.channel.permissionOverwrites.edit(rolesToAllow[i], {
                    SendMessages: true,
                    ViewChannel: true
                });
            }
        }

        message.reply("Le ticket a bien été passé en mode " + args[0] + ".");
    } catch (e) {
        message.reply("Erreur : " + e + " (restrictId: " + restrictId + ", allowId: " + allowId + ")");
    }
};

module.exports.config = {
    name: "restrict",
    description: "Retire l'acces au ticket aux guides et modérateurs",
    format: "restrict <admin/mods/none>",
    alias: ["adminonly", "modonly", "modoonly"],
    canBeUseByBot: true,
    category: "Ticket",
    needed_args: 1,
    bypassChannel: true,
    permission: PermissionFlagsBits.ManageMessages
};
