module.exports.run = async(client, message) => {
    message.channel.send(client.guilds.cache.map(r => r.name + ` | **${r.memberCount}** membres`))
};

module.exports.config = {
    name: "serverlist",
    description: "Voir la liste des serveurs qui ont le bot",
    format: "serverlist",
    canBeUseByBot: false,
    category: "hidden",
    delete: true
};
