const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19101, "datam " + args.join(' '), message, "fac1");
};

module.exports.config = {
    name: "datam",
    description: "Datamanagement en jeu",
    format: "datam <rename/copy/delete/copytoserver/copytoproxy/mysql> <player/player_base> [player_destination]",
    canBeUseByBot: false,
    category: "Moderation",
    needed_args: 2,
    permission: PermissionFlagsBits.BanMembers
};
