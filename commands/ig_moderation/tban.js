const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let link = client.commands.get("link");
    args[0] = await link.parseArg(args[0], message, client.mysqlingame);
    if (!args[0]) return; //error message already thrown

    let rcon = client.commands.get("rcon");
    ban(rcon, args, message.member, message);
    //this is a tricky hack to hardcode the staff which ban
    [19001, 19002, 19003, 19004, 19005, 19101, 19102, 19103, 19201, 19202, 19203, 19204]
        .forEach(element => setTimeout(function(){rcon.config.rconfunc(element, "kick "+args.join(' '), message, element, false)}, 5500));
};

function ban(rcon, args, member, message, port = 19101) {
    rcon.config.rconfunc(port, "tban " + args.join(' ')+ " [({" + message.member.user.tag + "})]", message, port)
        .catch(err => {
            console.log(err);
            let newPort = port + 1;
            if (newPort === 19104) {
                return message.reply("Aucun serveur accesible", {allowedMentions: { repliedUser: false }});
            }
            ban(rcon, args, member, message, newPort);
        });
}

module.exports.config = {
    name: "tban",
    description: "Ban un joueur en jeu",
    format: "tban <user> <duration> [raison]",
    canBeUseByBot: false,
    category: "Moderation",
    needed_args: 2,
    permission: PermissionFlagsBits.BanMembers
};
