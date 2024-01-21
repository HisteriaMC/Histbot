const config = require("../../config.json");
const {PermissionsBitField} = require("discord.js");
const shell = require('shelljs')

module.exports.run = async(client, message, args) => {
    console.log("world")
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)

    let SSHcommand = "cd /root/servers && ./updateserver.sh "+(args[0] ?? "");

    message.reply("En attente de réponse..").then(async (msg) => {
        let replied = shell.exec("ssh root@192.168.1.100 \"" + SSHcommand + "\"", {silent:true}).stdout;
        //count lines of replied
        msg.edit(SSHcommand+"\n"+replied);
    });
};

module.exports.config = {
    name: "updateserver",
    description: "Mettre à jour pocketmine sur les serveurs",
    format: "updateServer [server]",
    aliases: ["update"],
    canBeUseByBot: true,
    category: "hidden",
    needed_args: 0,
    args: {server: "string"},
    permission: PermissionsBitField.Flags.Administrator
};