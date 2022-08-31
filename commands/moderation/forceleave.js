const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
    message.reply("Début de l'envoie des requêtes, ça peut prendre un peu de temps 😓");

    let rcon = client.commands.get("rcon");
    [19132, 19133, 19134, 19141, 19142, 19143, 19144, 19135] //All
        .forEach(element => setTimeout(function(){rcon.config.rconfunc(element, "forceleave "+args[0], message, element)}, 5500));
};

module.exports.config = {
    name: "forceleave",
    description: "Forceleave un joueur en jeu",
    format: "forceleave <pseudo>",
    canBeUseByBot: false,
    category: "Moderation",
    permission: PermissionFlagsBits.BanMembers,
    needed_args: 1
};
