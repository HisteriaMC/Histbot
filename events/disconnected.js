module.exports = (client) => {
    console.log("Bot disconnect, tentative de reconnexion");
    client.login(process.env.TOKEN);

    client.log(`Le bot a été déconnecté.`, 'staff')
}