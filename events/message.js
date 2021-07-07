const config = require("../config.json");
const prefix = config.prefix;
let lastxp = {};

module.exports = (client, message) => {
    if (message.channel.type === 'dm') return;
    if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
    linkticket(message);
    helpping(client, message);
    xp(client, message);
    if (!message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let commande = args.shift().toLowerCase();
    let cmd = client.commands.get(commande);

    if (!cmd) return;
    if (message.author.bot && !cmd.canBeUseByBot) return;
    if(cmd.restrictchannels && cmd.restrictchannels.includes(message.channel.id)) return;

    cmd.run(client, message, args);
};

function linkticket (message){
    if (!message.channel.parent ||
        (message.channel.parent && !config.tickets.allchannels.includes(message.channel.parent.id))
        || message.member.hasPermission("MANAGE_MESSAGES")) return;
    if (message.content.includes('http') || message.content.includes('www.') || message.content.includes('.com')){
        message.channel.send(`${message.content} par ${message.author}`);
    }
}
function helpping (client, message){
    if(message.content.startsWith("<@!"+client.user.id+">")){
        message.reply("Pour avoir de l'aide utiliser +help")
    }
}
function xp (client, message){ //Inspired from https://github.com/Androz2091/AtlantaBot/blob/a56c9aaf8283703d9ad745935e4ec9163ec531ab/events/message.js#L252
    if(![config.serverid, config.staffserverid].includes(message.guild?.id)) return;
    if(message.author.bot) return;
    if(message.content.length <= 5) return;
    let id = message.author.id;
    let lvl = client.xpapi.getLvl(id);

    let date = new Date();
    if(lastxp[id] >= date.getTime()) return;

    client.xpapi.addXP(id, 1);
    lastxp[id] = date.getTime() + 60000;

    const won = Math.floor(Math.random() * ( Math.floor(10) - Math.ceil(5))) + Math.ceil(5);
    const neededXp = 5 * (lvl * lvl) + 80 * lvl + 100;
    const newXp = client.xpapi.getXP(id);
    if(newXp >= neededXp){
        client.xpapi.addLvl(id, won);
    }
}