const config = require("../config.json");
const mcutil = require('minecraft-server-util');

module.exports = (client, oldMember, member) => {
    if (member.pending || !oldMember.pending) return; //not accepted rules yet or already accepted
    if(member.guild.id === config.serverId) mcutil.statusBedrock('192.168.1.42', {port: config.port, enableSRV: true, timeout: 5000})
        .then((response) => {
            const d = new Date();

            member.send({
                embeds: [{
                    title: `__Merci d'avoir rejoint Histeria !__`,
                    color: config.color,
                    timestamp: d,
                    footer: {
                        icon_url: config.imageURL,
                        text: "@Histeria "+d.getFullYear()
                    },
                    fields: [
                        {
                            name: "IP",
                            value: "histeria.fr"
                        },
                        {
                            name: `Joueurs connectés (<t:${Math.round(d/1000)}:R>)`,
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
                }]
            }).catch(error => {
                console.log("Impossible de dm le joineur")
                console.log(error)
            });

        })
        .catch((error) => {
            console.error("Erreur récupération status " + error);
        });

    let role = member.guild.roles.cache.find(r => r.name === "Histerien");
    if(!role) return console.log("Il n'y a pas de role Histerien sur le serveur");
    member.roles.add(role).catch();
};