const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
    if (!Number.isInteger(parseInt(args[1]))) return message.reply("Le montant n\'est pas valide");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19101, "takemoney " + args[0] + " " + args[1], message, "fac1");
};

module.exports.config = {
    name: "takemoney",
    description: "Prendre de la money à un joueur",
    format: "takemoney <pseudo> <montant>",
    canBeUseByBot: false,
    category: "Moderation",
    needed_args: 2,
    permission: PermissionFlagsBits.BanMembers
};
