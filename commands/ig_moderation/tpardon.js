const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let rcon = client.commands.get("rcon");
    rcon.config.rconfunc(19101, "tpardon " + args.join(' '), "fac1");
};

module.exports.config = {
    name: "tpardon",
    description: "Deban un joueur en jeu",
    format: "tpardon <pseudo>",
    canBeUseByBot: false,
    category: "In Game",
    alias: ["pardon", "tunban"],
    permission: PermissionFlagsBits.BanMembers,
    needed_args: 1,
    args: {pseudo: "string"}
};
