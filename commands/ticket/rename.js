const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    message.delete();
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
    if (!message.guild.member(client.user).hasPermission("MANAGE_CHANNELS")) return message.channel.send("Je n'ai pas la permission !").catch(console.error);
    if (!message.channel.parent || !config.tickets.allchannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.");


    let arg = args.slice(0).join(' ');
    if (arg === "effectué" || arg === "ok") {
        let categoryid = message.guild.id === config.serveridjava ? config.tickets.java.categoryclosed : config.tickets.bedrock.categoryclosed;
        await message.channel.setParent(categoryid);
        message.channel.setName('effectué')
    } else {
        message.channel.setName(arg)
    }
};

module.exports.config = {
    name: "rename",
    description: "Renommer un ticket",
    format: "+rename <nom>",
    canBeUseByBot: false,
    category: "Moderation"
};
