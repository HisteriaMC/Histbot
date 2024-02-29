const config = require("../../config.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message) => {
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)
    console.log(`Reboot par ${message.author.tag}`);
    message.channel.send("Reboot du bot lancée").then(() => {
        client.destroy()
        process.exit(1);
    })
};

module.exports.config = {
    name: "reset",
    description: "Reboot le bot",
    format: "reset",
    canBeUseByBot: true,
    category: "hidden",
    permission: PermissionFlagsBits.Administrator,
    alias: ["rebootbot"]
};
