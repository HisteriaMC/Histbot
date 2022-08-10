const config = require("../config.json");
const mcutil = require('minecraft-server-util');
const moment = require('moment');

module.exports = (client, member) => {
    let channel = member.guild.channels.cache.get(config.welcome);
    if(!channel) return;
    channel.send(`**[<a:ANNONCE:700068339929710693>]** ${member.user} vient de rejoindre Histeria`);


    if(member.guild.id === config.serverid) mcutil.statusBedrock('histeria.fr', {port: config.port, enableSRV: true, timeout: 5000})
        .then((response) => {
            const d = new Date();

            member.send({
                embed: {
                    title: `__Merci d'avoir rejoint Histeria !__`,
                    color: 0xff0000,
                    timestamp: moment().format('LLL'),
                    footer: {
                        text: "@Histeria "+d.getFullYear()
                    },
                    fields: [
                        {
                            name: "IP",
                            value: "histeria.fr"
                        },
                        {
                            name: `Joueurs connectés (<t:${d/1000}:R>)`,
                            value: response.onlinePlayers+"/"+response.maxPlayers
                        },
                        {
                            name: "Version actuelle",
                            value: response.version
                        },
                        {
                            name: 'Vote',
                            value: `[Vote](https://bit.ly/histeriavote) puis fait /vote en jeu pour recevoir des récompenses`
                        },
                        {
                            name: 'Boutique',
                            value: `[Boutique](https://shop.histeria.fr), les achats sont automatiquement distribué sur le serveur`
                        }
                    ],
                }
            }).catch(() => console.log("Impossible de dm le joineur"));

        })
        .catch((error) => {
            console.error("Erreur récupération status " + error);
        });

    let role = member.guild.roles.cache.find(r => r.name === "Histerien");
    if(!role) return console.log("Il n'y a pas de role Histerien sur le serveur");
    member.roles.add(role).catch();
};