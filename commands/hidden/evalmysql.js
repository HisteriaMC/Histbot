const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)
    if(!args[0]) return message.reply("Manque d'argument")
    let command = args.join(" ");
    client.mysqlminicore.execute(command, function(err, results) {
        message.channel.send(command)
        if(err) message.channel.send(err)
        if(results) message.channel.send(results.join(" \n"))
    });
};

module.exports.config = {
    name: "evalmysql",
    description: "Executer du mysql sur minicore",
    format: "+evalmysql",
    canBeUseByBot: true,
    category: "hidden"
};
