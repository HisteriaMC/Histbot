const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    client.mysqlminicore.query("DELETE FROM `banPlayers` WHERE player = ?", [args[0]], function (err, result){
        if(err) {
            console.error(err);
            message.reply("Erreur");
        }
        if(result.affectedRows > 0){
            message.reply("Déban effectué");
        } else {
            message.reply("Aucun joueur banni avec ce pseudo");
        }
    })
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
