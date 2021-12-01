const hidden = require("../../hidden.json");
const mcutil = require('minecraft-server-util');
const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let serverbase = args.shift().toLowerCase();
    let reason = args.join(" ");
    if(reason === "help") return message.reply("La commande help est bloquée car elle cause des soucis");

    let port;
    switch(serverbase){
        case "faction1": case "f1": case "fac1": port = 19133; break;
        case "faction2": case "f2": case "fac2": port = 19134; break;
	    case "faction3": case "f3": case "fac3": port = 19135; break;
        case "minage1": case "min1": port = 19141; break;
        case "minage2": case "min2": port = 19142; break;
        case "minage3": case "min3": port = 19143; break;
        case "minage4": case "min4": port = 19144; break;
        case "lobby": port = 19132; break;
        case "test": port = 19150; break;
        case "all": port = "all"; break;
        default:
            if(isNaN(serverbase)) port = serverbase;
            else port = "error";
        break;
    }

    if(port === "error"){
        message.reply("Le serveur n'existe pas, veuillez choisir un serveur [fac1 à 3 | min1 à 4 | lobby | all]");
        return;
    }
    if(port === "all"){
        [19132, 19133, 19134, 19141, 19142, 19143, 19144, 19135, 19150]
            .forEach(element => setTimeout(function(){rconfunc(element, reason, message, element)}, 5500));
        return;
    }
    rconfunc(port, reason, message, serverbase);
};
function rconfunc(port, reason, message, server)
{
    const rcon = new mcutil.RCON(hidden.rcon.host, { port: port, enableSRV: false, timeout: 5000, password: hidden.rcon.password});
    rcon.connect()
        .then(() => rcon.run(reason))
        .catch((error) => {message.channel.send("Erreur sur la connexion : "+error); console.error(error)});
    rcon.on('output', (out) => {
        if(out && out.length > 1900) out = "\nLa réponse est trop longue";
        else if (!out) out = "Pas de réponse";
        message.reply({
            embeds: [{
                title: `RCON sur **${server}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.image_url,
                    text: "@Histeria "+new Date().getFullYear()
                },
                fields: [
                    {
                        name: 'Requête',
                        value: String(reason),
                        inline: true
                    },
                    {
                        name: 'Réponse',
                        value: String(out),
                        inline: true
                    }
                ]
            }]
        })
        rcon.close();
    });
}

module.exports.config = {
    name: "rcon",
    description: "Envoyer des commandes au serveur MC",
    format: "rcon <fac1 à 3 | min1 à 4 | lobby | all> <commande>",
    canBeUseByBot: false,
    category: "Admin",
    alias: ["jrcon"],
    rconfunc: rconfunc,
    permission: "ADMINISTRATOR",
    needed_args: 2,
    args: {
        server: "string",
        command: "string"
    }
};
