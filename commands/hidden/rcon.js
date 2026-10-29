const hidden = require("../../hidden.json");
const mcutil = require('minecraft-server-util');
const config = require("../../config.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

//Shortcuts to the server names of config.rcon.ports, which also work as-is
const aliases = {
    "f1": "faction1", "fac1": "faction1",
    "f2": "faction2", "fac2": "faction2",
    "min1": "minage1", "min2": "minage2", "min3": "minage3", "min4": "minage4",
    "lobby": "lobby1",
    "b1": "build1",
    "b2": "build2"
};

module.exports.run = async(client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id)) return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let serverbase = args.shift().toLowerCase();
    let reason = args.join(" ");
    if(reason === "help") return message.reply("La commande help est bloquée car elle cause des soucis");

    if(serverbase === "all"){
        config.rcon.all
            .forEach(name => setTimeout(function(){rconfunc(config.rcon.ports[name], reason, message, name)}, 5500));
        return;
    }

    let name = Object.hasOwn(aliases, serverbase) ? aliases[serverbase] : serverbase;
    if(!Object.hasOwn(config.rcon.ports, name)){
        message.reply("Le serveur n'existe pas, veuillez choisir un serveur [fac1 à 2 | min1 à 4 | lobby | all]");
        return;
    }
    rconfunc(config.rcon.ports[name], reason, message, name);
};
function rconfunc(port, reason, message, server, reply = true) {
    return new Promise((resolve, reject) => {
        const rcon = new mcutil.RCON(hidden.rcon.host, { port: port, enableSRV: false, timeout: 5000, password: hidden.rcon.password});
        rcon.connect()
            .then(() => rcon.run(reason))
            .catch((error) => {
                if (message) {
                    message.channel.send("Erreur sur la connexion : "+error);
                }
                console.error(error);
                reject(error);
            });
        rcon.on('output', (out) => {
            if(out && out.length > 1900) out = "\nLa réponse est trop longue";
            else if (!out) out = "Pas de réponse";

            if (message && reply) {
                message.reply({
                    embeds: [{
                        title: `RCON sur **${server}**`,
                        color: config.color,
                        timestamp: new Date(),
                        footer: {
                            icon_url: config.imageURL,
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
                    }],
                    allowedMentions: { repliedUser: false }
                });
            }

            rcon.close();
            resolve(out);
        });
    });
}

module.exports.config = {
    name: "rcon",
    description: "Envoyer des commandes au serveur MC",
    format: "rcon <fac1 à 2 | min1 à 4 | lobby | all> <commande>",
    canBeUseByBot: false,
    category: "Admin",
    alias: ["jrcon"],
    rconfunc: rconfunc,
    permission: PermissionFlagsBits.Administrator,
    needed_args: 2,
    args: {
        server: "string",
        command: "string"
    }
};
