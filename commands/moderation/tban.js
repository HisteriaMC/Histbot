const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19133, "tbantext " + args.join(' '), message, "fac1");
    [19132, 19133, 19134, 19141, 19142, 19143, 19144, 19135]
        .forEach(element => setTimeout(function(){rcon.config.rconfunc(element, "kick "+args.join(' '), message, element, false)}, 5500));
};

module.exports.config = {
    name: "tban",
    description: "Ban un joueur en jeu",
    format: "tban <user> <duration> [raison]",
    canBeUseByBot: false,
    category: "Moderation",
    needed_args: 2,
    permission: PermissionFlagsBits.BanMembers
};
