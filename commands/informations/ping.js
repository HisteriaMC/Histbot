module.exports.run = async(client, message) => {
    await message.channel.send("Pinging..")
        .then(async(m) => await
            m.edit(`${message.author} Pong! La latence du bot est de ${m.createdTimestamp - message.createdTimestamp}ms. La latence du bot + api discord est de ${Math.round(client.ws.ping)}ms`));
};

module.exports.config = {
    name: "ping",
    description: "Calcul du ping du bot",
    format: "ping",
    category: "Informations",
    canBeUseByBot: true,
    delete: true
};
