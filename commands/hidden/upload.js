const config = require("../../config.json");
const {PermissionsBitField} = require("discord.js");
const fs = require('fs');
const shell = require('shelljs')

module.exports.run = async(client, message, args) => {
    console.log("hello world")
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)

    if(args[0]) {
        try {
            await fs.cpSync("/root/v6/miscs/" + args[0]+"/plugins/MiniCoreV6", "/root/v6/upload/MiniCoreV6", { recursive: true })
            message.reply('success!')
        } catch (err) {
            message.reply(err)
        }
    }

    shell.cd("/root/v6/upload/");
    shell.exec('./upload.sh plugins MiniCoreV6');
    message.reply("On va dire que ça a marché hein");
};

module.exports.config = {
    name: "upload",
    description: "Upload le core",
    format: "upload",
    canBeUseByBot: true,
    category: "hidden",
    permission: PermissionsBitField.Flags.Administrator
};
