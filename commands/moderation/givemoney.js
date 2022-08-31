const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
    if (!Number.isInteger(parseInt(args[1]))) return message.reply("Le montant n\'est pas valide");

    client.mysqlminicore.query("UPDATE money SET money = money + ? WHERE userName = ?", [args[1], args[0]], function (err) {
        if (err) {
            console.error(err);
            message.reply("Erreur");
            return;
        }

        message.reply("**"+args[1] + '$** ont bien été donné à **' + args[0]+"**");
    });
};

module.exports.config = {
    name: "givemoney",
    description: "Give de la money à un joueur",
    format: "givemoney <pseudo> <montant>",
    canBeUseByBot: false,
    category: "Moderation",
    permission: PermissionFlagsBits.BanMembers,
    needed_args: 2
};
