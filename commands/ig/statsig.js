const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    let link = client.commands.get("link");
    let username = await link.parseArg(args[0], message, client.mysqlingame);
    if (!username) return; //error message already thrown

    client.mysqlingame.query("SELECT * FROM `stats` WHERE player = ?", [username], function (err, results){
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
                    value: String("<t:"+result.firstjoin+":R> (<t:"+result.firstjoin+":F>)"),
                    inline: true
                },
                {
                    name: "Temps de jeu",
                    value: `${timeig.hour} heures, ${timeig.minute} et ${timeig.second} secondes`,
                    inline: true
                },
            ];
        if(result.online === "offline") {
            fields.push(
                {
                    name: "Dernière connexion",
                    value: String("<t:"+result.quit+":R> (<t:"+result.quit+":F>)"),
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

        message.reply({
            embeds: [{
                title: `Information du joueur **${result.player}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
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

module.exports.config = {
    name: "stats",
    description: "Voir les informations d'un joueur en jeu",
    format: "stats [pseudo]",
    alias: ["statsingame", "statsplayer", "statsi", "statsig"],
    canBeUseByBot: false,
    category: "In Game",
    iglink: true,
    needed_args: 0,
    args: {pseudo: "string"}
};
