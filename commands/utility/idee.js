const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if(config.serverid !== message.guild.id && config.serveridjava !== message.guild.id) return message.reply("Les idées ne sont pas disponible sur ce serveur");
    let idee = args.join(" ");
    if(!idee) return message.reply("Format : "+this.config.format);
    idee = idee.replace(/`/g, '');
    let channelid = message.guild.id === config.serverid ? config.idees.channelbedrock : config.idees.channeljava;
    message.reply("Ton idée a été posté dans <#"+channelid+">.");
    let channel = await client.channels.resolve(channelid);
    if(!channel) message.reply("Salon idée introuvable "+channelid);
    channel.send('Idée par ' + `${message.author}` + '\n\n' + '```' + idee + '```')
        .then(async function (msgidee) {
            for(const emote of [config.idees.emoteyes, config.idees.emoteno, config.idees.emotedelete]){
                await msgidee.react(emote);
            }
        })
};

module.exports.config = {
    name: "idee",
    description: "Donner une idée dans le salon correspondant",
    format: "+idee <idée>",
    alias: ["idée", "jidée", "jidee", "suggest", "suggestion"],
    canBeUseByBot: false,
    category: "Utilitaire"
};
