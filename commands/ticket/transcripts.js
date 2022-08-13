const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    let target = message.guild.members.cache.get(message.mentions.users.first());
    if(!target) target = message.guild.members.cache.get(args[0]);

    let callback = function(err, results) {sendResults(message, results, target?.id, args)};
    if(!args[0]){
        client.mysql.execute('SELECT * FROM `transcripts` WHERE userid = ?', [message.author.id], callback);
    } else {
        if(message.member.permissions.has(Permissions.BAN_MEMBERS) && [config.serverId, config.staffServerId].includes(message.guild.id)) {
            if(target){
                client.mysql.execute('SELECT * FROM `transcripts` WHERE userid = ?', [target.id], callback);
            } else if(args[0].match(/^\d+$/g)){
                client.mysql.execute('SELECT * FROM `transcripts` WHERE userid = ?', [args[0]], callback);
            } else if(args[0] === 'name') {
                    if (!args[1]) return message.reply('Il manque le nom de la personne ciblée');
                    target = args[1];
                    client.mysql.execute('SELECT * FROM `transcripts` WHERE username = ?', [target], callback);
            }
        } else return message.reply("Vous n'avez pas la permission");
    }
};
function sendResults(message, results, who, args, id = true)
{
    if(!results[0]) return message.channel.send('Aucun résultat trouvé');

    if(message.author.id == who) who = 'Vos transcripts';
    else if(id) who = 'Transcripts de <@'+who+'> ('+results[0].name+')';
    else who = 'Transcripts de '+who+' (<@'+results[0].userid+'> '+results[0].name+')'

    let content = '';
    results.forEach(result => {
        content = content.concat(`${result.name} [${result.id}](https://transcripts.histeria.fr/${result.id}\)\n`)
    });
    let d = new Date();
    message.author.send({
        embeds: [{
            title: `**__Transcripts__**`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria "+d.getFullYear()
            },
            fields: [
                {
                    name: who,
                    value: content.substring(0, 1024)
                }
            ],
        }]
    }).then(() => message.reply('Je vous ai envoyé le résultat en DM'))
        .catch(() => message.reply("Je n'arrive pas à vous envoyer de message, assurez vous d'autoriser les messages privés avec au moins un serveur en commun avec moi"));

}

module.exports.config = {
    name: "transcripts",
    description: "Voir la liste de ses tickets",
    format: "transcripts [user/'name'] [pseudo/'force']",
    canBeUseByBot: false,
    category: "Ticket"
};
