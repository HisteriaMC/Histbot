const hidden = require("../../hidden.json");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19133, "safegive " + args.join(' '), message, "fac1");
};

module.exports.config = {
    name: "safegive",
    description: "Give de manière sûre un joueur en jeu",
    format: "safegive <user> <item> [nombre]",
    canBeUseByBot: false,
    category: "Moderation",
    needed_args: 2,
    permission: "BAN_MEMBERS"
};
