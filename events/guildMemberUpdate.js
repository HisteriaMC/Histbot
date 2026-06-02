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
    
    
    
    let userID = oldMember.id ?? member.id;
    
    if (!oldMember.roles.cache.has(config.ranks.Booster) && member.roles.cache.has(config.ranks.Booster)) {
        
        client.mysqlingame.query("SELECT * FROM discord_link WHERE discord = ?", [userID], async function(err, result) {
          
          if (err) {
              console.log('Une erreur est survenue ' + err)
              return;
          }
          
          if (!result || !result[0]) return;
          
          let playerIG = result[0].player;
          let rank = await getRank(client.mysqlingame, playerIG);
          let rankLs = ['histerien', 'vip'];
          
          if (!rankLs.includes(rank)) return;
          
          setRank(playerIG, 'booster');
          member.send('Le grade **booster** vous a été ajouté sur le compte **' + playerIG + '**.').catch((err) => {
              console.log('Le user suivant a désactivé ses messages privés: ' + member.username)
          })
          
            
        })
        
    }
    
    if (oldMember.roles.cache.has(config.ranks.Booster) && !member.roles.cache.has(config.ranks.Booster)) {
        
        client.mysqlingame.query("SELECT * FROM discord_link WHERE discord = ?", [userID], async function(err, result) {
          
          if (err) {
              console.log('Une erreur est survenue ' + err)
              return;
          }
          
          if (!result || !result[0]) return;
          
          let playerIG = result[0].player;
          let rank = await getRank(client.mysqlingame, playerIG);
          
          if (rank !== 'booster') return;
          
          setRank(playerIG, 'histerien');
          member.send('Le grade **booster** vous a été retiré sur le compte **' + playerIG + '**.').catch((err) => {
              console.log('Le user suivant a désactivé ses messages privés: ' + member.username)
          })
          
            
        });
        
    }
    
    
    async function getRank(mysql, player) {
    return new Promise((resolve, reject) => {
        mysql.query("SELECT * FROM `ranks` WHERE player = ?", [player], function (err, results) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            if (!results || !results[0]) {
                resolve(null);
                return;
            }
            resolve(results[0].rank);
        })
    })
}


    
    function setRank(player, rank) {
        client.mysqlingame.query('UPDATE ranks SET rank = ? WHERE player = ?', [rank, player], function(err) {
            
            if (err) {
                console.log('Une erreur est survenue ' + err)
            }
        })
    }
};