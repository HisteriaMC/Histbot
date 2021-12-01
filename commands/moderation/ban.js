const {User} = require("discord.js");
module.exports.run = async(client, message, args) => {
    if(!message.guild.members.cache.get(client.user.id).permissions.has('BAN_MEMBERS')) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    let banned = message.mentions.users.first();
    if(!banned && args[0]) banned = message.guild.members.cache.get(args[0]);
    if(!banned) return message.reply("Utilisateur introuvable.");
    if(banned instanceof User) banned = message.guild.members.cache.get(banned.id);

    args = args.slice(1);//Enlever le pseudo du banni
    let banReason = args.join(" ");
    if(!banReason) banReason = "Aucune raison fournie";
    if(!banned.bannable) return message.reply(`Je ne peut pas ban ${banned.user} parce que c'est une personne plus puissante que moi :sob:`)

    await banned.send(`Vous avez été banni du serveur **${message.guild.name}** par **${message.author.username}** pour **${banReason}** <a:banhammer:784899600473260042>`)
        .catch(error => {console.log("Impossible de dm le banni "+message.guild.name+" erreur : "+error)})

    setTimeout(() => {
        banned.ban({reason: "Bot Histeria | " + banReason}).then(member => {
        message.reply(`<a:banhammer:784899600473260042> **${member.user.username}** a bien été banni par **${message.author.username}** pour **${banReason}**.`);
    }) .catch(err => {
        message.reply(`Désolé ${message.author} je ne peux pas ban cette personne parce que : ${err}`);
    })}, 2000);
};

module.exports.config = {
    name: "ban",
    description: "Bannir quelqu'un du serveur discord.",
    format: "ban <user> [raison]",
    canBeUseByBot: false,
    category: "Moderation",
    permission: "BAN_MEMBERS",
    needed_args: 1
};
