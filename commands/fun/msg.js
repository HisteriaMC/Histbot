module.exports.run = async(client, message, args) => {
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
    permission: "MANAGE_MESSAGES",
    needed_args: 1,
    delete: true,
    args: {
        user: "user",
        message: "string"
    }
};
