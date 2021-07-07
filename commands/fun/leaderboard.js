const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    const d = new Date(), top = await client.xpapi.getTop(args[0] ?? 10);
    if (args[0] && args[0] > 100) return message.reply("Taille du top demandée trop grande")
    let description = '';

    for (const [key, user] of Object.entries(top)) {
        let member = await client.users.fetch(user.id).catch(() => ''), username;
        if (member) username = member.username;
        else username = user.id + "(erreur)";
        description = description.concat(`${key}. ${username} **${user.lvl}** level | **${user.xp}** xp\n`);
    }
    if(description.length > 2048) description = description.slice(0, 2048);
    message.reply({
        embed: {
            title: `**Leaderboard XP**`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.image_url,
                text: "@Histeria " + d.getFullYear()
            },
            description: description
        }
    })
};


module.exports.config = {
    name: "leaderboard",
    description: "Récupérer le top des membres en xp du serveur",
    format: "+leaderboard <max>",
    canBeUseByBot: false,
    category: "Fun"
};
