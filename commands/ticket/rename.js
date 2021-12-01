const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    if (!message.channel.parent || !config.tickets.allchannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.");

    let categoryid = config.tickets.categoryclosed;
    let arg = args.slice(0).join(' ');
    if (arg === "effectué" || arg === "ok") {
        await message.channel.setParent(categoryid);
        message.channel.setName('effectué')
    } else {
        if(message.channel.parent.id === categoryid) await message.channel.setParent(config.tickets.categoryopened);
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
    permission: "MANAGE_MESSAGES",
    delete: true,
    neeeded_args: 1
};
