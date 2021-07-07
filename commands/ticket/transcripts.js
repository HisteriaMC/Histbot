const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    let target = message.guild.member(message.mentions.users.first());
    if(!target) target = message.guild.member(args[0]);

    if(!args[0]){
        client.mysql.execute('SELECT * FROM `transcripts` WHERE userid = ?', [message.author.id],
            function(err, results) {
                sendResults(message, results, message.author.id, args)
            });
    } else if(target){
        if(message.member.permissions.has('MANAGE_MESSAGES') && message.guild.id === config.serverid) {
            client.mysql.execute('SELECT * FROM `transcripts` WHERE userid = ?', [target.id],
                function(err, results) {
                    sendResults(message, results, target.id, args)
                });
        } else return message.reply("Vous n'avez pas la permission");
    } else if(args[0].match(/^\d+$/g)){
        if(message.member.permissions.has('MANAGE_MESSAGES') && message.guild.id === config.serverid) {
            client.mysql.execute('SELECT * FROM `transcripts` WHERE userid = ?', [args[0]],
            function(err, results) {
                sendResults(message, results, args[0], args)
            });
        } else return message.reply("Vous n'avez pas la permission");
    } else if(args[0] === 'name') {
        if (message.member.permissions.has('MANAGE_MESSAGES') && message.guild.id === config.serverid) {

            if (!args[1]) return message.reply('Il manque le nom de la personne ciblée');
            target = args[1];

            client.mysql.execute('SELECT * FROM `transcripts` WHERE username = ?', [target],
                function (err, results) {
                    sendResults(message, results, target, args, false)
                });
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
        embed: {
            title: `**__Transcripts__**`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.image_url,
                text: "@Histeria "+d.getFullYear()
            },
            fields: [
                {
                    name: who,
                    value: content
                }
            ],
        }
    }).then(() => message.reply('Je vous ai envoyé le résultat en DM'))
        .catch(() => message.reply("Je n'arrive pas à vous envoyer de message, assurez vous d'autoriser les messages privés avec au moins un serveur en commun avec moi"));

}

module.exports.config = {
    name: "transcripts",
    description: "Voir la liste de ses tickets",
    format: "+transcripts <user/'name'> [pseudo/'force']",
    canBeUseByBot: false,
    category: "Ticket"
};
