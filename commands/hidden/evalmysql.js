const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!config.owners.includes(message.author.id)) return message.channel.send(`**Seulement le bg peut faire ça** :sunglasses:`)
    if(!args[0]) return message.reply("Manque d'argument")
    let command = args.join(" ");
    client.mysqlminicore.execute(command, function(err, raw) {
        if(err) message.channel.send(err)
        if(raw){
            let results = "";
            raw.forEach(result => {
                for (const [key, val] of Object.entries(result)) {
                    results = results.concat("**"+key+":** "+val+"\n");
                }
                results = results.concat("\n");
            });
            message.channel.send(results)
        }
    });
};

module.exports.config = {
    name: "evalmysql",
    description: "Executer du mysql sur minicore",
    format: "+evalmysql",
    canBeUseByBot: true,
    category: "hidden"
};
