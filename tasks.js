const mcutil = require('minecraft-server-util');
const config = require('./config.json');

class run {
    changestatus() {
        this.client.guilds.fetch(config.serverId).then(
            guild => {
                this.client.user.setActivity(`${guild.memberCount} membres | +help`, {
                    type: "STREAMING",
                    url: "https://www.twitch.tv/dadodasyra"
                });
                setTimeout(() => {
                    this.changestatus2().catch(r => console.log("Erreur change statut : " + r));
                }, 7000);
            });
    }

    async changestatus2() {
        mcutil.statusBedrock('histeria.fr', {port: config.port, enableSRV: true, timeout: 5000})
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
        this.client.user.setActivity("play.histeria.fr | "+config.port, {
            type: "STREAMING",
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

    constructor(client) {
        this.client = client;
        this.changestatus();
        setInterval(() => {this.checkideas()}, 120 * 1000); //2 min
        setInterval(() => {client.xpapi.save()}, 600 * 1000);
    }
}
module.exports = run;