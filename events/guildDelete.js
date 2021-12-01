module.exports = (client, guild) => {
    client.log(`Le bot a été supprimé du serveur ${guild.name} ${guild.id} (${guild.members.cache.size} membres)`)
}