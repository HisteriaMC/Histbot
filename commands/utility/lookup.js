const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    let member = message.mentions.members.first() || message.member;
    if(!member && args[0]) return message.channel.send("Veuillez mentionner un utilisateur !")
    if(!member) member = message.member;
    const activities = member.presence.activities;
    let playing;

    if(!activities) playing = "Aucune";
    else {
        activities.forEach(activity => {
            let activitytype = getActivityType(activity.type);
            let toadd = activitytype ? activitytype:''+" "+activity.name;
            if(activity.details) toadd = toadd.concat(", "+activity.details);
            if(activity.state) toadd = toadd.concat(", "+activity.state);
            toadd = toadd.concat(' (Depuis '+moment.unix(activity.createdAt).calendar().toLowerCase()+')');

            if(!playing) playing = toadd;
            else playing = playing.concat("\n\n"+toadd);
        });
    }

    let createdat = moment.utc(member.user.createdAt);
    let joinat = moment.utc(member.joinedAt);
    message.channel.send({
        embeds: [{
            color: config.color,
            title: `Statistiques de **${member.user.tag}**`,
            thumbnail: {
                url: member.user.displayAvatarURL
            },
            fields: [
                {
                    name: "Compte créé le",
                    value: createdat.format("LLL")+` (${createdat.fromNow()})`
                },
                {
                    name: "A rejoint le",
                    value: joinat.format("LLL")+` (${joinat.fromNow()})`
                },
                {
                    name: "Status",
                    value: getStatus(member.presence.status)
                },
                {
                    name: "Jeu",
                    value: playing ? playing : "Aucune activité"
                }
            ],
            footer: {
                text: `Informations de l'utilisateur ${member.user.tag}`
            }
        }]
    })

};
function getStatus(type)
{
    switch(type){
        case "dnd": return "Ne pas déranger";
        case "online": return "En ligne";
        case "idle": return "Absent";
        default: case "offline": return "Hors ligne"
    }
}
function getActivityType(type)
{
    switch(type){
        case "LISTENING": return "Écoute";
        case "PLAYING": return "Joue à";
        case "STREAMING": return "Stream";
        case "WATCHING": return "Regarde";
    }
}

module.exports.config = {
    name: "lookup",
    description: "Voir les informations d'un utilisateur discord",
    format: "lookup [user]",
    alias: ["whois", "ui"],
    canBeUseByBot: false,
    category: "Utilitaire"
};
