const config = require("../config.json");
const Reverso = require("reverso-api");
const reverso = new Reverso();
const prefix = config.prefix;
let lastxp = {};
let lastcount;


module.exports = (client, message) => {
    if(message.author.id === client.user.id) return;
    if (message.channel.type === 'DM') return;
    //linkticket(message);
    helpping(client, message);
    xp(client, message);
    counting(client, message);
    checkSpelling(client, message);

    if (!message.content.startsWith(prefix)) {
        autorespond(client, message);
        return;
    }

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let commande = args.shift().toLowerCase();
    let cmd = client.commands.get(commande);

    if (!cmd) return;
    let conf = cmd.config;
    if (conf.permission && !message.member.permissions.has(conf.permission)) return message.reply("Vous n'avez pas la permission d'utiliser cette commande");
    if (conf.needed_args && conf.needed_args > args.length) return message.reply("Il manque un argument. Format: "+config.prefix + conf.format)
    if (message.author.bot && !conf.canBeUseByBot) return;
    if (message.guild.id === config.serverId
        && message.channel.id !== config.commandChannel
        && !message.member.permissions.has("MANAGE_MESSAGES")
        && !conf.bypassChannel) return;
    if (conf.delete) message.delete();

    cmd.run(client, message, args);
};

function autorespond (client, message){
    if(message.guild.id !== config.serverId) return;
    if(message.author.bot) return;
    let stopped = false;
    message.content.split(' ').forEach(autorespondname => {
        autorespondname = autorespondname.toLowerCase();
        if (!stopped && client.autorespond.get(autorespondname)) {
            message.reply(client.autorespond.get(autorespondname));
            stopped = true;
        }
    });
}
/*function linkticket (message){
    if (!message.channel.parent ||
        (message.channel.parent && !config.tickets.allchannels.includes(message.channel.parent.id))
        || message.member.permissions.has("MANAGE_MESSAGES")) return;
    if (message.content.includes('http') || message.content.includes('www.') || message.content.includes('.com'))
        message.channel.send(`${message.content} par ${message.author}`);

}*/
function helpping (client, message){
    if(message.content.startsWith("<@!"+client.user.id+">")) message.reply("Pour avoir de l'aide utilisez "+config.prefix+"help")
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
            message.channel.send("On recommence à 0 à cause de <@"+message.author.id+"> on était à "+lastcount);
            lastcount = 0;
            if(lastcount > 5)
                await message.channel.permissionOverwrites.edit(message.author.id, {'SEND_MESSAGES': false}, "Fail sur le count à " + lastcount);
        } else lastcount = lastcount + 1;
    }
}
function xp (client, message){ //Inspired from https://github.com/Androz2091/AtlantaBot/blob/a56c9aaf8283703d9ad745935e4ec9163ec531ab/events/message.js#L252
    if(![config.serverId, config.staffServerId].includes(message.guild?.id)) return;
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

function checkSpelling(client, message){
    if(message.author.bot) return;
    if(message.channel.id === config.checkSpellingChannel) {
        reverso.getSpellCheck(message.content.replace(/<a*:[^:\s]*(?:[^:\s]*)*:\d+>/g, ''), 'French', (response) => {
            if(response.length <= 0) return;
            let fieldsOfFields = [[]];
            let size = 0;
            response.forEach(suggestion => {
                let matchs = suggestion.explanation.match(/#![^#]*#\$/g);
                let first;
                matchs.forEach(match => {
                    let word = match.replace('#!', '').replace('#$', '');
                    if(!first) first = word;
                    suggestion.explanation = suggestion.explanation.replace(match, word !== '' ? "**"+word+"**" : '');
                });
                let full = switchTypeSpelling(suggestion.type)+"  ->  __"+first+"__"+suggestion.explanation;
                size += full.length;
                if(size > 5000){
                    fieldsOfFields.push([]);
                    size = full.length;
                }
                fieldsOfFields[fieldsOfFields.length - 1].push({
                    name: switchTypeSpelling(suggestion.type)+"  ->  __"+first+"__", // /#![^#]*#\$/
                    value: suggestion.explanation
                })
            });
            let count = 0;
            let content = message.content.length < 1000 ? message.content : "Message trop long" ;
            fieldsOfFields.forEach(field => {
                if(count === 0){
                    message.channel.send({
                        embeds: [{
                            color: config.color,
                            title: `Message de **${message.author.tag}**`,
                            description: ">>> " + content,
                            thumbnail: {
                                url: message.member.displayAvatarURL
                            },
                            fields: field,
                            footer: {
                                text: `Suggestions de corrections pour ${message.author.tag}`,
                                image: message.author.icon_url
                            }
                        }]
                    })
                } else {
                    message.channel.send({
                        embeds: [{
                            color: config.color,
                            title: `Message de **${message.author.tag}** partie ` + (count + 1),
                            thumbnail: {
                                url: message.member.displayAvatarURL
                            },
                            fields: field,
                            footer: {
                                text: `Suggestions de corrections pour ${message.author.tag}`,
                                image: message.author.icon_url
                            }
                        }]
                    })
                }
                count++;
            })
        }).catch(err => {
            message.emoji.add("❌");
            console.error(err);
        });
    }
}
function switchTypeSpelling(type){
    switch(type){
        case 'Grammar': return 'Grammaire';
        case 'Spelling': return 'Orthographe';
        case 'Punctuation': return "Ponctuation";
        default: return type;
    }
}