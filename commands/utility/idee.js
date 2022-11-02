const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if(config.serverId !== message.guild.id) return message.reply("Les idées ne sont pas disponible sur ce serveur");

    let idee = args.join(" ");
    idee = idee.replace(/`/g, '');
    let channelid = config.idees.channel;
    let channel = await client.channels.resolve(channelid);
    if(!channel) message.reply("Salon idée introuvable "+channelid);
    message.reply("Ton idée a été posté dans <#"+channelid+">.");
    channel.send('Idée par ' + `${message.author}` + '\n\n' + '```' + idee + '```')
        .then(async function (msgidee) {
            for(const emote of [config.idees.emoteYes, config.idees.emoteNo]){
                await msgidee.react(emote);
            }
        })
};

module.exports.config = {
    name: "idee",
    description: "Donner une idée dans le salon correspondant",
    format: "idee <idée>",
    alias: ["idée", "suggest", "suggestion"],
    canBeUseByBot: false,
    category: "hidden",
    needed_args: 1
};
