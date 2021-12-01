const config = require('../../config.json')

module.exports.run = async(client, message, args) => {
    let target = message.mentions.users.first();
    if(!target && args[0]) target = message.guild.members.cache.get(args[0]);
    if(!target) target = message.member;

    const d = new Date();
    let full = client.xpapi.getFull(target.id);
    if(!full) return message.reply('Utilisateur non trouvé');

    message.reply({
        embeds: [{
            title: `Statistiques de **${target.displayName??target.username}**`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria "+d.getFullYear()
            },
            fields: [
                {
                    name: 'Level',
                    value: `${full.lvl}`,
                    inline: true
                },
                {
                    name: 'XP',
                    value: `${full.xp} / ${5 * (full.lvl * full.lvl) + 80 * full.lvl + 100}`,
                    inline: true
                },
                {
                    name: 'Rank',
                    value: `឵឵${await client.xpapi.getRank(target.id)}`,
                    inline: true
                },
            ]
        }]
    })
};

module.exports.config = {
    name: "xp",
    description: "Récupérer votre xp ou celle d'un membre sur le discord",
    format: "xp [user]",
    canBeUseByBot: false,
    category: "Fun",
    args: {user: "user"}
};
