module.exports.run = async(client, message, args) => {
    if(!args[0]) return message.reply("Format de la commande : "+module.exports.config.format);
    message.delete();

    let msg = args.join(" ");

    if(!msg) return message.reply("Il manque le message que vous souhaitez envoyer");

    message.channel.send(msg).catch(err =>
        message.channel.send(`Désolé ${message.author} je ne peux pas envoyer de message à cette personne car : ${err}`)
    )
};

module.exports.config = {
    name: "say",
    description: "Faire parler le bot",
    format: "say <message>",
    category: "Fun",
    canBeUseByBot: false,
    permission: Permissions.BAN_MEMBERS,
    needed_args: 1,
    args: {message: "string"}
};
