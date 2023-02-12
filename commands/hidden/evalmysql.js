const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");
    let command = args.join(" ");
    client.mysqlingame.execute(command, function(err, raw) {
        if(err) message.channel.send(err)
        if(raw){
            let results = "";
            //check if raw is an array or an object
            if(raw?.length > 0){
                raw.forEach(result => {
                    for (const [key, val] of Object.entries(result)) {
                        results = results.concat("**"+key+":** "+val+"\n");
                    }
                    results = results.concat("\n");
                });
            } else results = raw.toString();

            if(results !== "") message.channel.send(results);
            else message.channel.send("Pas de résultats");
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
