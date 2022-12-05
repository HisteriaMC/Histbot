const {ActivityType} = require("discord-api-types/v10");
const mcutil = require('minecraft-server-util');
const config = require('./config.json');
const hidden = require('./hidden.json');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class run {
    async vote() {
        const d = new Date();
        const file = await fetch('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key=' + hidden.mcpeToken).then(response => response.json());
        if(!file) return console.error("Error when getting details from minecraftpocket-servers");
        const filefinal = Object.values(file);

        let messages = await this.client.guilds.cache.get(config.serverId).channels.cache.get(config.castVote).messages.fetch({limit: 5});
        let found = false;
        messages.forEach(message => {
            if(message.author.id === this.client.user.id && !found){
                /*const embeds = [{
                    "color": config.color,
                    "title": "**__VOTE__**",
                    url: "https://bit.ly/histeriavote",
                    timestamp: d,
                    footer: {
                        "icon_url": config.imageURL,
                        "text": "@Histeria "+d.getFullYear()
                    },
                    "thumbnail": {
                        "url": "https://cdn.discordapp.com/avatars/537670570158850060/0dd939b1b54f2d26dc3290fa0b3d8b3e.png?size=2048"
                    },
                    "fields": [
                        {
                            "name": "Vote",
                            "value": "**Il est l'heure de __[VOTER](https://bit.ly/histeriavote)__**"
                        },
                        {
                            "name": "Récupère ta récompense",
                            "value": "Récupère ta récompense avec **\/vote** en jeu"
                        },
                        {
                            "name": "Notifications de Vote",
                            "value": "Si vous souhaitez recevoir les notifications réagissez 📝 dans <#790143305325215764>"
                        },
                        {
                            "name": `Statistiques (à <t:`+Math.floor(Date.now() / 1000)+`:t>)`,
                            "value": `Votes ce mois : ${filefinal[16]}\nRank mondial : ${filefinal[15]}\nFavoris : ${filefinal[17]}\nJoueurs connectés : ${filefinal[9]}`
                        }
                    ]
                }];
                message.edit({ content: "<@&"+config.voteRole+">", embeds }) It seems to cause rate limits
                    .then(() => console.log("Successfully edited vote message"))
                    .catch(() => console.error("Erreur lors du message de vote pour update"));*/
                found = true;
                if (!this.lastvote) this.lastvote = message.createdAt.getDate();
            }
        });

        console.log(d.getHours())

        if (d.getHours() === 16 && this.lastvote !== d.getDate()) {
            console.log("Sending vote message, current hour is "+d.getHours()+ " and last vote was "+this.lastvote);
            this.lastvote = d.getDate();
            let cmd = this.client.commands.get("castvote");
            if (!cmd) return;

            cmd.run(this.client);
        }
    }

    changestatus() {
        this.client.guilds.fetch(config.serverId).then(
            guild => {
                this.client.user.setActivity(`${guild.memberCount} membres | +help`, {
                    type: ActivityType.Streaming,
                    url: "https://www.twitch.tv/dadodasyra"
                });
                setTimeout(() => {
                    this.changestatus2().catch(r => console.log("Erreur change statut : " + r));
                }, 7000);
            });
    }

    async changestatus2() {
        mcutil.statusBedrock('192.168.1.42', {port: config.port, enableSRV: true, timeout: 5000})
            .then((response) => {
                this.client.user.setActivity(`joueurs: ${response["onlinePlayers"]}/${response["maxPlayers"]}`, {
                    type: ActivityType.Streaming,
                    url: "https://www.twitch.tv/dadodasyra"
                })
            })
            .catch((error) => {
                console.error("Erreur récupération status " + error);
            });

        setTimeout(() => {
            this.changestatus3()
        }, 7000);
    }

    changestatus3() {
        this.client.user.setActivity("play.histeria.fr | "+config.port, {
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/dadodasyra"
        });
        setTimeout(() => {
            this.changestatus();
        }, 7000);
    }

    async checkideas() {
        let channel = await this.client.channels.resolve(config.idees.channel);
        if(!channel) return console.log("Channel des idées introuvable");
        let messages = await channel.messages.fetch({limit: 30}).catch(err => console.log(err));
        if(!messages) return;
        messages.forEach(message => {
            let emotes = message.reactions.cache;
            let emoteyesid = config.idees.emoteYes.split(":")[2].replace(">", "");
            let emoteyes = emotes.get(emoteyesid);
            let emotenoid = config.idees.emoteNo.split(":")[2].replace(">", "");
            let emoteno = emotes.get(emotenoid);

            if(!emoteyes || !emoteno) return;
            let content = message.content.split("\n");
            let lastline = content[content.length - 1];
            content = content.splice(0, content.length - 1);

            if(emoteno.count > 3 && (emoteno.count * 100 / (emoteyes.count + emoteno.count - 2)) > 50){ //emotedelete > 3
                this.client.log(message.content.split("\n").splice(2, content.length).join('\n')+' **a été supprimé**', "gen");
                message.delete();
            } else if(emoteyes.count > 30 && (emoteyes.count - 1) * 100 / (emoteno.count + emoteyes.count - 2) > 90 && !message.pinned){
                message.pin().then( () => {
                    this.client.log(content[0]+' **a été épinglé**', "gen");
                    message.channel.messages.fetch({ limit: 1 }
                    ).then(messages => {
                    if (message && message.author.id === this.client.user.id) messages.first().delete();})});
            } else if(emoteyes.count > 1 || emoteno.count > 1){
                let reactspreview = `\n`+Math.round((emoteyes.count - 1) * 100 / (emoteno.count + emoteyes.count - 2))+`% ${config.idees.emoteYes}/${config.idees.emoteNo}`;
                if(lastline.includes('%') && lastline.includes('/')){
                    if(reactspreview === "\n"+lastline) return;

                    message.edit(content.join('\n')+reactspreview);
                } else {
                    message.edit(message.content+reactspreview);
                }
            }
        });
    }

    async checkCountBanned() {
        let client = this.client;
        client.mysqldiscord.query(`SELECT * FROM countBanned`, function(err, results) {
            let now = Math.floor(Date.now() / 1000);
            if(!results) return;
            results.forEach(row => {
                if(row["expire"] < now) {
                    //ban is expired
                    client.mysqldiscord.query(`DELETE FROM countBanned WHERE user = ?`, [row["user"]]);
                    //fetch user and remove his role
                    client.guilds.cache.get(config.serverId).members.fetch(row["user"]).then(member => {
                        if (!member) return;
                        member.roles.remove(config.countBannedRole);
                    });
                }
            });
        });
    }

    constructor(client) {
        this.client = client;
        this.changestatus();
        this.vote();
        this.checkCountBanned();
        setInterval(() => {this.checkideas()}, 120 * 1000); //2 min
        setInterval(() => {client.xpapi.save()}, 600 * 1000); //10 min
        setInterval(() => {this.vote()}, 900 * 1000); //15 min
        setInterval(() => {this.checkCountBanned()}, 180 * 1000); //3 min
    }
}
module.exports = run;