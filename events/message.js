const config = require("../config.json");
const prefix = config.prefix;
let lastxp = {};
let lastcount;

module.exports = (client, message) => {
    if (message.channel.type === 'dm') return;
    if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
    linkticket(message);
    helpping(client, message);
    xp(client, message);
    counting(client, message)
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
    if(message.content.startsWith("<@!"+client.user.id+">")) message.reply("Pour avoir de l'aide utiliser +help")
}
async function counting(client, message) {
    if (message.channel.id === config.counting && message.author.id !== client.user.id) {
        if (!lastcount) {
            let found = false;
            let messages = await message.channel.messages.fetch({limit: 5}).catch(err => console.log(err));
            messages.forEach(msg => {
                let numtest = msg.content.split(' ')[0]??"no";
                if(!found && Number.isInteger(numtest)){
                    lastcount = numtest;
                    found = true;
                }
            });
            if(!found) lastcount = 0;
        }

        let num = message.content.split(' ')[0]??"no";
        if(num === 0) num = 1;
        if(num != lastcount + 1){
            message.channel.send("On recommence à 0 à cause de <@"+message.author.id+"> on était à "+lastcount)
            lastcount = 0;
            //message.delete();
            /*message.author.send("Petite explication :" +
                "\nAlors en gros dans ce salon on compte, ce qui défini en gros rajouter 1 à chaque fois. " +
                "Par exemple actuellement on est à **"+lastcount+"** donc la théorie voudrait que ce que tu dois dire est **"+ (lastcount + 1) +"**." +
                "\nJe comprends, c'est compliqué etc.. Si tu as toujours besoin d'aide j'ai une petite vidéo pour toi : <https://www.youtube.com/watch?v=IQY_rk0o29Y>")
                .catch(() => console.log("Impossible de dm un counter raté"));*/
        } else lastcount = lastcount + 1;
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