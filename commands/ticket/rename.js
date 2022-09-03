const config = require('../../config.json');
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allChannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.");

    let categoryid = config.tickets.categoryClosed;
    let arg = args.slice(0).join(' ');
    if (arg === "effectué" || arg === "ok") {
        await message.channel.setParent(categoryid);
        message.channel.setName('effectué')
    } else {
        if(message.channel.parent.id === categoryid) await message.channel.setParent(config.tickets.categoryOpened);
        message.channel.setName(arg)
    }
};

module.exports.config = {
    name: "rename",
    description: "Renommer un ticket",
    format: "rename <nom>",
    canBeUseByBot: false,
    category: "Moderation",
    bypassChannel: true,
    permission: PermissionFlagsBits.ManageMessages,
    delete: true,
    neeeded_args: 1
};
