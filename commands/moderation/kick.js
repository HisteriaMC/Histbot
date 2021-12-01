const {User} = require("discord.js");
module.exports.run = async(client, message, args) => {
    if(!message.guild.members.cache.get(client.user.id).permissions.has("KICK_MEMBERS")) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    let kicked = message.mentions.users.first();
    if(!kicked && args[0]) kicked = message.guild.members.cache.get(args[0]);
    if(!kicked) return message.reply("Utilisateur introuvable.");
    if(kicked instanceof User) kicked = message.guild.members.cache.get(kicked.id);

    args = args.slice(1);//Enlever le pseudo du kicked
    let kickReason = args.join(" ");
    if(!kickReason) kickReason = "Aucune raison fournie";
    if(!kicked.kickable) return message.reply(`Je ne peut pas ban <@${kicked.id}> parce que c'est une personne plus puissante que moi :sob:`)

    await kicked.send(`Vous avez été kick du serveur **${message.guild.name}** par **${message.author.username}** pour **${kickReason}** <:JeuMeuBanneu:740126520533844049>`)
        .catch(error => {console.log("Impossible de dm le kick "+message.guild.name+" erreur : "+error)})

    setTimeout(() => {
        kicked.kick({reason: "Bot Histeria | " + kickReason}).then(member => {
        message.reply(`<:JeuMeuBanneu:740126520533844049> **${member.user.username}** a bien été kick par **${message.author.username}** pour **${kickReason}**.`);
    }) .catch(err => {
        message.reply(`Désolé ${message.author} je ne peux pas kick cette personne parce que : ${err}`);
    })}, 2000);
};

module.exports.config = {
    name: "kick",
    description: "Kick quelqu'un du serveur discord.",
    format: "kick <user> [raison]",
    canBeUseByBot: false,
    category: "Moderation",
    permission: "KICK_MEMBERS",
    needed_args: 1
};
