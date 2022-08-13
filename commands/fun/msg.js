const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");
module.exports.run = async(client, message, args) => {
	if(!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
    let msged = message.mentions.users.first();
    if(!msged) msged = message.guild.members.cache.get(args[0]);
    if(!msged) msged = message.member;
    else args.shift(); //remove user pinged

    let msg = args.join(" ");
    if(!msg) return message.reply("Il manque le message que vous souhaitez envoyer");

    msged.send(msg).then(
        message.channel.send(`Le message a été envoyé !`)
    ) .catch(err =>
        message.channel.send(`Désolé ${message.author} je ne peux pas envoyer de message à cette personne car ${err}`)
    )
};

module.exports.config = {
    name: "msg",
    description: "Envoyer un message privé via le bot.",
    format: "msg <user> <message>",
    category: "Fun",
    canBeUseByBot: false,
    permission: PermissionFlagsBits.BanMembers,
    needed_args: 1,
    delete: true,
    args: {
        user: "user",
        message: "string"
    }
};
