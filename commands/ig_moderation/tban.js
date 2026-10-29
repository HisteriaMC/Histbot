const hidden = require("../../hidden.json");
const config = require("../../config.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let link = client.commands.get("link");
    args[0] = await link.parseArg(args[0], message, client.mysqlingame);
    if (!args[0]) return; //error message already thrown

    let rcon = client.commands.get("rcon");
    if (!await ban(rcon, args, message)) return;
    //kick only once the ban landed, so the player cannot rejoin before it exists
    config.rcon.kick
        .forEach(name => rcon.config.rconfunc(config.rcon.ports[name], "kick "+args.join(' '), message, name, false).catch(() => null));
};

//Tries each faction in turn until one of them takes the ban. Resolves to whether one did.
async function ban(rcon, args, message) {
    for (const name of config.rcon.factions) {
        try {
            await rcon.config.rconfunc(config.rcon.ports[name], "tban " + args.join(' ')+ " [({" + message.member.user.tag + "})]", message, name);
            return true;
        } catch (err) {
            console.log(err);
        }
    }
    message.reply({content: "Aucun serveur accesible", allowedMentions: { repliedUser: false }});
    return false;
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
