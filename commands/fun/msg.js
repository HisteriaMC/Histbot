const config = require("../../config.json");
module.exports.run = async(client, message, args) => {
    if(!args[0]) return message.reply("Format de la commande : "+module.exports.config.format);

    let msged = message.guild.member(message.mentions.users.first());
    if(msged) {
        if(!config.rcon.servers.includes(message.channel.guild.id) ||
            (config.rcon.servers.includes(message.channel.guild.id) && !message.member.hasPermission("MANAGE_MESSAGES"))) {
            args = args.slice(1);//Enlever le pseudo du muted
        } else {
            args[0] = "<@"+message.author+"> : ";
        }
    } else {
        msged = message.member;
    }

    let msg = args.join(" ");
    if(!msg) return message.reply("Il manque le message que vous souhaitez envoyer");

    msged.send(msg).then(
        message.channel.send(`Le message a été envoyé !`)
    ) .catch(err =>
        message.channel.send(`Désolé ${message.author} je ne peux pas envoyer de message à cette personne car : ${err}`)
    )
};

module.exports.config = {
    name: "msg",
    description: "Envoyer un message privé via le bot.",
    format: "+msg [user] [message]",
    category: "Fun",
    canBeUseByBot: false
};
