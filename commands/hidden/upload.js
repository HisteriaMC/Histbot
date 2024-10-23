const {PermissionsBitField} = require("discord.js");
const shell = require('shelljs')
const hidden = require("../../hidden.json");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let SSHcommand = "";
    if (args[0] === "beta") {
        let server = args[1] ?? "betatest";
        SSHcommand = `cd /root/servers && for dir in v7/*/plugins; do echo \"Copying files to \\$dir\"; cp -r miscs/${server}/plugins/* \"\\$dir\"; done`;
    } else {
        let plugin = args[1] ?? "MiniCore";
        let path = args[2] ?? "plugins";

        if(args[0]) {
            SSHcommand = "cp /root/servers/miscs/" + args[0] + "/"+path+"/"+plugin+"/ /root/servers/upload/ -r && ";
        }

        SSHcommand += "cd /root/servers/upload/ && ./upload.sh " + path + " " + plugin;
    }
    message.reply("En attente de réponse..").then(async (msg) => {
        let replied = shell.exec("ssh root@192.168.1.100 \"" + SSHcommand + "\"", {silent: true}).stdout;
        //count lines of replied
        let lines = replied.split("\n").length;
        msg.edit("`" + SSHcommand + "`\nOn va dire que ça a marché hein, réponse de **" + lines + "** lignes\n" + replied.split("\n").slice(0, 3).join("\n"));
    });
};

module.exports.config = {
    name: "upload",
    description: "Upload le core",
    format: "upload",
    canBeUseByBot: true,
    category: "hidden",
    permission: PermissionsBitField.Flags.Administrator
};
