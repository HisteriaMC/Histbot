const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
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
    description: "Executer du mysql sur la db main",
    format: "evalmysql <query>",
    canBeUseByBot: true,
    category: "hidden",
    needed_args: 1,
    args: {query: "string"},
    permission: PermissionFlagsBits.Administrator,
};
