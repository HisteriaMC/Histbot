const config = require("../../config.json");
const hidden = require("../../hidden.json");
const fetch = (...args) => import('node-fetch').then(module => module.default(...args))

module.exports.run = async(client, message) => {
    if(message){
        message.delete().catch(()=>{});
        if(!message.member.permissions.has("KICK_MEMBERS")) return;
        //if(!message.member.isBot) return;
    }

    const file = await fetch('https://minecraftpocket-servers.com/api/?object=servers&element=detail&key='+hidden.mcpeToken).then(response => response.json());
    if(!file) return console.error("Error when getting details from minecraftpocket-servers");
    const filefinal = Object.values(file);
    const d = new Date();

    const embeds = [{
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
                "value": "Récupère ta récompense avec **/vote** en jeu"
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

    client.guilds.cache.get(config.serverId).channels.cache.get(config.castVote)
        .send({ content: "<@&"+config.voteRole+">", embeds })
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