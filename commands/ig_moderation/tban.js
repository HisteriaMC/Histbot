const hidden = require("../../hidden.json");
const config = require("../../config.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let link = client.commands.get("link");
    args[0] = await link.parseArg(args[0], message, client.mysqlingame);
    if (!args[0]) return; //error message already thrown

    let rcon = client.commands.get("rcon");
    ban(rcon, args, message.member, message);
    //this is a tricky hack to hardcode the staff which ban
    config.rcon.kick
        .forEach(name => setTimeout(function(){rcon.config.rconfunc(config.rcon.ports[name], "kick "+args.join(' '), message, name, false)}, 5500));
};

//Tries each faction in turn until one of them takes the ban
function ban(rcon, args, member, message, index = 0) {
    let name = config.rcon.factions[index];
    rcon.config.rconfunc(config.rcon.ports[name], "tban " + args.join(' ')+ " [({" + message.member.user.tag + "})]", message, name)
        .catch(err => {
            console.log(err);
            if (index + 1 >= config.rcon.factions.length) {
                return message.reply("Aucun serveur accesible", {allowedMentions: { repliedUser: false }});
            }
            ban(rcon, args, member, message, index + 1);
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
