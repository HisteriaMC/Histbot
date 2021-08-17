const mcutil = require('minecraft-server-util');
const config = require('./config.json');
const fetch = require('node-fetch');
class run {
    async vote() {
        const d = new Date();
        const file = await fetch('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key=' + config.mcpetoken).then(response => response.json());
        const filefinal = Object.values(file);

        let messages = await this.client.guilds.cache.get(config.serverid).channels.cache.get(config.castvote).messages.fetch({limit: 5});
        let found = false;
        messages.forEach(message => {
           if(message.author.id === this.client.user.id && !found){
               const embed = {
                   "color": config.color,
                   "title": "**__VOTE__**",
                   "url": "https://vote.histeria.fr",
                   "timestamp": d,
                   "footer": {
                       "icon_url": "https://cdn.discordapp.com/avatars/537670570158850060/0dd939b1b54f2d26dc3290fa0b3d8b3e.png?size=2048",
                       "text": "@Histeria 2021"
                   },
                   "thumbnail": {
                       "url": "https://cdn.discordapp.com/avatars/537670570158850060/0dd939b1b54f2d26dc3290fa0b3d8b3e.png?size=2048"
                   },
                   "fields": [
                       {
                           "name": "Vote",
                           "value": "**Il est l'heure de __[VOTER](https://vote.histeria.fr)__**"
                       },
                       {
                           "name": "Récupère ta récompense",
                           "value": "Récupère ta récompense avec **/vote** en jeu"
                       },
                       {
                           "name": "Notif Vote",
                           "value": "Si vous souhaitez recevoir les notifications réagissez <:poceblue:707204758066430035> dans <#790143305325215764>\nhttps://vote.histeria.fr"
                       },
                       {
                           "name": "Statistiques",
                           "value": `Votes ce mois : ${filefinal[16]}\nRank mondial : ${filefinal[15]}\nJoueurs connectés (à ${d.getHours()}h${d.getMinutes()}m) : ${filefinal[9]}`
                       }
                   ]
               }
               message.edit("<@&"+config.voterole+">", { embed }).catch(() => console.err("Erreur lors du message de vote pour update"));
               found = true;
           }
        });

        if (d.getHours() === 16 && this.lastvote !== d.getDate()) {//Maintenant fonctionnel
            this.lastvote = d.getDate();
            let cmd = this.client.commands.get("castvote");
            if (!cmd) return;

            cmd.run(this.client);
        }
    }

    changestatus() {
        this.client.guilds.fetch(config.serverid).then(
            guild => {
                this.client.user.setActivity(`${guild.memberCount} membres | +help`, {
                    type: "STREAMING",
                    url: "https://www.twitch.tv/dadodasyra"
                }).then();
                setTimeout(() => {
                    this.changestatus2().catch(r => console.log("Erreur change statut : " + r));
                }, 7000);
            });
    }

    async changestatus2() {
        mcutil.statusBedrock('histeria.fr', {port: 19132, enableSRV: true, timeout: 5000})
            .then((response) => {
                this.client.user.setActivity(`joueurs: ${response["onlinePlayers"]}/${response["maxPlayers"]}`, {
                    type: "STREAMING",
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
        this.client.user.setActivity("play.histeria.fr | 19132", {
            type: "STREAMING",
            url: "https://www.twitch.tv/dadodasyra"
        }).then();
        setTimeout(() => {
            this.changestatus();
        }, 7000);
    }

    async checkideas() {
        for (const channelid of [config.idees.channelbedrock, config.idees.channeljava]) { //Check serv java + bedrock
            let channel = await this.client.channels.resolve(channelid);
            let messages = await channel.messages.fetch({limit: 30}).catch(err => console.log(err));
            if(!messages) return;
            messages.forEach(message => {
                let emotes = message.reactions.cache;
                let emoteyesid = config.idees.emoteyes.split(":")[2].replace(">", "");
                let emoteyes = emotes.get(emoteyesid);
                let emotenoid = config.idees.emoteno.split(":")[2].replace(">", "");
                let emoteno = emotes.get(emotenoid);
                /*let emotedeleteid = config.idees.emotedelete.split(":")[2].replace(">", "");
                let emotedelete = emotes.get(emotedeleteid);*/

                if(!emoteyes || !emoteno /*|| !emotedelete*/) return;
                let content = message.content.split("\n");
                let lastline = content[content.length - 1];
                let platform = config.idees.channelbedrock === channelid ? "bedrock" : "java";
                content = content.splice(0, content.length - 1);
                if(emoteno.count > 3 && (emoteno.count * 100 / (emoteyes.count + emoteno.count - 2)) > 50){ //emotedelete > 3
                    this.client.log(message.content.split("\n").splice(2, content.length).join('\n')+' **a été supprimé**', platform);
                    message.delete();
                } else if(emoteyes.count > 30 && (emoteyes.count - 1) * 100 / (emoteno.count + emoteyes.count - 2) > 90 && !message.pinned){
                    message.pin().then( () => {
                        this.client.log(content[0]+' **a été épinglé**', platform);
                        message.channel.messages.fetch({ limit: 1 }
                        ).then(messages => {
                        if (message && message.author.id === this.client.user.id) messages.first().delete();})});
                } else if(emoteyes.count > 1 || emoteno.count > 1){
                    let reactspreview = `\n`+Math.round((emoteyes.count - 1) * 100 / (emoteno.count + emoteyes.count - 2))+`% ${config.idees.emoteyes}/${config.idees.emoteno}`;
                    if(lastline.includes('%') && lastline.includes('/')){
                        if(reactspreview === "\n"+lastline) return;

                        message.edit(content.join('\n')+reactspreview);
                    } else {
                        message.edit(message.content+reactspreview);
                    }
                }
            });
        }
    }

    constructor(client) {
        this.client = client;
        this.changestatus();
        setInterval(() => {this.vote()}, 600000);//10 min
        setInterval(() => {this.checkideas()}, 120000); //2 min
        setInterval(() => {client.xpapi.save()}, 600000);
    }
}
module.exports = run;