const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!message.member.permissions.has("BAN_MEMBERS")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
    if (!config.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
    if (!args[0]) return message.reply("Il manque la personne à qui donner l'argent");
    if (!args[1]) return message.reply("Il manque le montant à donner");
    if (!Number.isInteger(parseInt(args[1]))) return message.reply("Le montant n\'est pas valide");

    client.mysqlminicore.query("UPDATE money SET money = money - ? WHERE userName = ?", [args[1], args[0]], function (err) {
        if (err) {
            console.error(err);
            message.reply("Erreur");
            return;
        }

        message.reply(args[1] + ' ont bien été prit à ' + args[0]);
    });
};

module.exports.config = {
    name: "takemoney",
    description: "Prendre de la money à un joueur",
    format: "+takemoney <pseudo> <montant>",
    canBeUseByBot: false,
    category: "Moderation"
};
