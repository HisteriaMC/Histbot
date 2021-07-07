module.exports.run = async(client, message) => {
    await message.channel.send("Ping..")
        .then(async(m) => await
            m.edit(`${message.author} Pong! La latence est de ${m.createdTimestamp - message.createdTimestamp}ms. La latence du bot + api est de ${Math.round(client.ws.ping)}ms`));
};

module.exports.config = {
    name: "ping",
    description: "Calcul du ping du bot",
    format: "+ping",
    category: "Informations",
    canBeUseByBot: true
};
