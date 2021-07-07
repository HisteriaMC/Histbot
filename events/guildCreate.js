module.exports = (client, guild) => {
    const channel = guild.channels.cache
        .filter((channel) => channel.type === 'text')
        .first();
    if (!channel || !guild.member(client.user).hasPermission('CREATE_INSTANT_INVITE')) return;

        channel.createInvite({maxAge: 0, maxUses: 0})
        .then(async (invite) => {
            client.log(`Le bot a été rajouté sur le serveur ${guild.name} ${invite.url} (${guild.members.cache.size} membres)`, 'staff')
        })
        .catch((error) => console.log(error));
}