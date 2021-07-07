const config = require("../../config.json");
const fetch = require('node-fetch');

module.exports.run = async(client, message) => {
    if(message){
        message.delete().catch(()=>{});
        if(!message.member.hasPermission("KICK_MEMBERS")) return;
        //if(!message.member.isBot) return;
    }

    const file = await fetch('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key='+config.mcpetoken).then(response => response.json());
    const filefinal = Object.values(file);
    const d = new Date();

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

    client.guilds.cache.get(config.serverid).channels.cache.get(config.castvote).send("<@&"+config.voterole+">", { embed })
        .then(newmsg => newmsg.crosspost())
        .catch(() => console.err("Erreur lors du get du salon de vote"));

};

module.exports.config = {
    name: "castvote",
    description: "Cast vote par un bot",
    format: "+castvote",
    category: "hidden",
    canBeUseByBot: true
};
