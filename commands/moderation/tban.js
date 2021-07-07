const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    if (!message.member.permissions.has("BAN_MEMBERS")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
    if (!config.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19132, "tbantext " + args.join(' '), message);
};

module.exports.config = {
    name: "tban",
    description: "Ban un joueur en jeu",
    format: "+tban <pseudo> <durée> [raison]",
    canBeUseByBot: false,
    category: "Moderation"
};
