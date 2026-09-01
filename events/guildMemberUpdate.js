const config = require("../config.json");
const mcutil = require('minecraft-server-util');
const linkmanager = require("../linkmanager");

module.exports = (client, oldMember, member) => {
    boost(client, oldMember, member);

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
    member.roles.add(role).catch(error => console.error("Impossible de donner le role Histerien : " + error));
};

//Boosting sets premiumSince, unboosting clears it. This runs before the pending guard
//above, which lets through the rules acceptance and nothing else.
//An uncached oldMember carries no premiumSince, so a transition missed here is caught by
//the reconciliation pass in linkmanager instead.
function boost(client, oldMember, member) {
    if (member.guild.id !== config.serverId) return;

    if (!oldMember.premiumSince && member.premiumSince) linkmanager.onBoostStart(client, member);
    else if (oldMember.premiumSince && !member.premiumSince) linkmanager.onBoostEnd(client, member);
}