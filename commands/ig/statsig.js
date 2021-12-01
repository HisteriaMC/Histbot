const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    client.mysqlminicore.query("SELECT * FROM `stats` WHERE player = ?", [args[0]], function (err, results){
        if(err) {
            console.error(err);
            message.reply("Erreur");
        }

        if(!results || !results[0]) return message.reply("Aucun membre trouvé avec ce pseudo");
        let result = results[0];
        let timeig = convert(result.total + (result.online !== "offline" ? Date.now()/1000 - result.join : 0));
        let fields = [
                {
                    name: "Kills",
                    value: String(result.kill),
                    inline: true
                },
                {
                    name: "Death",
                    value: String(result.death),
                    inline: true
                },
                {
                    name: "Ratio",
                    value: String(Math.round(((result.kill < 2 ? 1 : result.kill) / (result.death < 2 ? 1 : result.death)) * 100) / 100),
                    inline: true
                },
                {
                    name: "Première connexion",
                    value: String(result.firstjoin),
                    inline: true
                },
                {
                    name: "Temps de jeu",
                    value: `${timeig.hour} heures, ${timeig.minute} et ${timeig.second} secondes`,
                    inline: true
                },
            ];
        if(result.online === "offline") {
            let lastconnexion = convertwithday(Date.now()/1000 - result.join);
            fields.push(
                {
                    name: "Dernière connexion",
                    value: `${lastconnexion.day} jours, ${lastconnexion.hour} heures, ${lastconnexion.minute} minutes et ${lastconnexion.second} secondes`,
                    inline: true
                });
        } else {
            fields.push(
                {
                    name: "Serveur",
                    value: result.online,
                    inline: true
                });
        }
 
        if(result.device !== ""){
            fields.push({
                name: "Appareil",
                value: String(result.device),
                inline: true
            });
        }
        message.reply({
            embeds: [{
                title: `Information du joueur **${result.player}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.image_url,
                    text: "@Histeria "+new Date().getFullYear()
                },
                fields: fields
            }]
        })
    })
        
};
function convert(time)
{
    let hour, minuteSec, minute, remainingSec, second;
    hour = Math.floor(time / 3600);
    minuteSec = time % 3600;
    minute = Math.floor(minuteSec / 60);
    remainingSec = minuteSec % 60;
    second = Math.ceil(remainingSec);

    return {hour: hour??0, minute: minute??0, second: second??0};
}

function convertwithday(time)
{
    let day, hourSec, hour, minuteSec, minute, remainingSec, second;
    day = Math.floor(time / 86400);
    hourSec = time % 86400;
    hour = Math.floor(hourSec / 3600);
    minuteSec = hourSec % 3600;
    minute = Math.floor(minuteSec / 60);
    remainingSec = minuteSec % 60;
    second = Math.ceil(remainingSec);

    return {day: day??0, hour: hour??0, minute: minute??0, second: second??0};
}
module.exports.config = {
    name: "stats",
    description: "Voir les informations d'un joueur en jeu",
    format: "stats <pseudo>",
    alias: ["statsingame", "statsplayer", "statsi", "statsig"],
    canBeUseByBot: false,
    category: "In Game",
    iglink: true,
    needed_args: 1,
    args: {pseudo: "string"}
};
