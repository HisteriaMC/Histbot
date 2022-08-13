module.exports = async(client) => {
    const tasks = require('../tasks.js');
    new tasks(client);
    console.log(`Le bot a été launch avec ${client.users.cache.size} utilisateurs, dans ${client.channels.cache.size} channels déservi et ${client.guilds.cache.size} serveurs.`);
    client.log(`Le bot a été launch avec ${client.users.cache.size} utilisateurs, dans ${client.channels.cache.size} channels et ${client.guilds.cache.size} serveurs.`, 'staff');
};