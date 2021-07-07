const config = require("../config.json");
const mcutil = require('minecraft-server-util');
const moment = require('moment');
module.exports = (client, member) => {
    let channel;
    if(member.guild.id === config.serverid) channel = member.guild.channels.cache.get(config.welcome);
    else channel = member.guild.channels.cache.get(config.welcomejava);

    if(!channel) return;
    channel.send(`**[<a:ANNONCE:700068339929710693>]** ${member.user} vient de rejoindre Histeria`);

    if(member.guild.id === config.serverid) mcutil.statusBedrock('histeria.fr', {port: 19132, enableSRV: true, timeout: 5000})
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
                            name: `Joueurs connectés (le ${d.getDate()}/${d.getMonth()}/${d.getFullYear()} à ${d.getHours()}h${d.getMinutes()}m)`,
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
};