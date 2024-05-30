const {PermissionsBitField} = require("discord.js");
const shell = require('shelljs')
const hidden = require("../../hidden.json");

module.exports.run = async(client, message, args) => {
    //if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    if (args[0] === "all") args[0] = "";
    let SSHcommand = "cd /root/servers && ./reboot.sh "+args[0]+" "+(args[1]??"");

    message.reply("En attente de réponse..").then((msg) => {
        shell.exec("ssh root@192.168.1.100 \"" + SSHcommand + "\"", {silent:true}, (code, stdout, stderr) => {
            // This callback function will be called when the SSH command finishes executing
            //count lines of replied
            msg.edit(SSHcommand+"\n"+stdout);
        });
    });
};

module.exports.config = {
    name: "reboot",
    description: "Redémarrer les serveurs",
    format: "reboot <server/all> [time]",
    aliases: ["restart"],
    canBeUseByBot: true,
    category: "hidden",
    needed_args: 1,
    args: {server: "string", time: "int"},
    permission: PermissionsBitField.Flags.Administrator
};