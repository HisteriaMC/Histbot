const config = require("../../config.json");
const mcutil = require('minecraft-server-util');

module.exports.run = async(client, message, args) => {
    if(!args[0]) return message.reply("Format: "+this.config.format);
    let reason = args.join(" ");
    if(message.member.isBot) return;

    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Tu n'as pas la permission d'utiliser la commande rcon");
    if (!config.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let serverbase = message.guild.id === config.serveridjava ? "java" : args.shift().toLowerCase();

    reason = args.join(" ");
    if(!reason) return message.reply("Merci de dire une commande.");
    if(reason === "help") return message.reply("La commande help est bloquée car elle cause des soucis");

    let port;
    switch(serverbase){
        case "faction1": case "f1": case "fac1": port = 19133; break;
        case "faction2": case "f2": case "fac2": port = 19134; break;
        case "minage1": case "min1": port = 19141; break;
        case "minage2": case "min2": port = 19142; break;
        case "minage3": case "min3": port = 19143; break;
        case "minage4": case "min4": port = 19144; break;
        case "lobby": port = 19132; break;
        case "all": port = "all"; break;
        case "java": port = 4298; break;
        default: port = "error"; break;
    }

    if(serverbase === "java"){
        let haverole = false;
        config.rcon.rolesjava.forEach(role => {if(message.member.roles.cache.has(role)) haverole = true;})
        if(!haverole) return message.channel.send("Petit malin vas ! Tu croyais me berner comme ça");
    }

    if(port === "error"){
        message.reply("Le serveur n'existe pas, veuillez choisir un serveur [faction1 à 2/fac1 à 2 | minage1 à 4/min1 à 4 | lobby | all]");
        return;
    }
    if(port === "all"){
        [19132, 19133, 19134, 19141, 19142, 19143, 19144]
            .forEach(element => setTimeout(function(){rconfunc(element, reason, message)}, 5500));
        return;
    }
    rconfunc(port, reason, message);
};
function rconfunc(port, reason, message)
{
    let password;
    if(port === 4298) password = config.rcon.passwordjava;
    else password = config.rcon.password;

    const rcon = new mcutil.RCON(config.rcon.host, { port: port, enableSRV: false, timeout: 5000, password: password});
    rcon.connect()
        .then(() => rcon.run(reason))
        .catch((error) => {
            message.channel.send("Erreur : "+error);
        });
    rcon.on('output', (out) => {
        if(!out) out = "Pas de réponse (bah oué logique)"
        else if(out > 1900) out = "La réponse est trop longue";
        message.channel.send("Effectué : " + reason)
        message.channel.send("Réponse : " + out);

        rcon.close().then();
    });
}

module.exports.config = {
    name: "rcon",
    description: "Envoyer des commandes au serveur MC",
    format: "+rcon <fac1 à 3 | min1 à 4 | lobby | all | java> [commande]",
    canBeUseByBot: true,
    category: "Admin",
    alias: ["jrcon"],
    rconfunc: rconfunc
};
