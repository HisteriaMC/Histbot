const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19102, "tban " + args.join(' ')+ " [({" + message.member.user.tag + "})]", message, "nico1");
    //this is a tricky hack to hardcode the staff which ban
    [19001, 19002, 19003, 19004, 19005, 19101, 19102, 19103, 19201, 19202, 19203, 19204]
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
