const {PermissionFlagsBits} = require("discord-api-types/v10");
const config = require("../../config.json");
const shell = require('shelljs');

module.exports.run = async(client, message, args) => {
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)

    let replied = shell.exec("ssh 192.168.1.100 -p 99 \""+args.join(" ")+"\"", {silent:true}).stdout;

    if(replied.length === 0) message.reply("Pas de réponse :(");
    else if(replied.length < 2000) message.reply(replied);
    else {
        let lines = replied.split("\n").length;
        message.reply("Réponse de "+lines+" lignes et trop longue pour être envoyée ("+replied.length+" caractères)");
    }

};

module.exports.config = {
    name: "ssh",
    description: "Executer du SSH sur le CT bedrock",
    format: "evalssh <query>",
    canBeUseByBot: true,
    category: "hidden",
    needed_args: 1,
    args: {query: "string"},
    permission: PermissionFlagsBits.Administrator,
};
