const config = require("../../config.json");

module.exports.run = async(client, message) => {
    let d = new Date();
    await message.channel.send({
        embed: {
            title: `Histeria Stats`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria "+d.getFullYear()
            },
            description: "Membres: " + message.guild.memberCount + "\n" +
                "Ne pas déranger: " + message.guild.members.cache.filter(d => d.presence.status === 'dnd').size + "\n" +
                "En ligne: " + message.guild.members.cache.filter(o => o.presence.status === 'online').size + "\n" +
                "Inactif: " + message.guild.members.cache.filter(i => i.presence.status === 'idle').size + "\n" +
                "Hors ligne: " + message.guild.members.cache.filter(a => a.presence.status === 'offline').size
        }
    });
};

module.exports.config = {
    name: "stats",
    description: "Voir les statistiques du serveur",
    format: "stats",
    canBeUseByBot: true,
    category: "Informations",
    alias: ["info"]
};
