const {User} = require("discord.js");
module.exports.run = async(client, message, args) => {
    if(!message.guild.members.cache.get(client.user.id).permissions.has(Permissions.MANAGE_ROLES)) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    let muted = message.mentions.users.first();
    if(!muted && args[0]) muted = message.guild.members.cache.get(args[0]);
    if(!muted) return message.reply("Utilisateur introuvable.");
    if(muted instanceof User) muted = message.guild.members.cache.get(muted.id);

    let mutedrole = message.guild.roles.cache.find(r => r.name === "Muted");
    if(!mutedrole) return message.reply("Il n'y a pas de role Muted sur ce serveur :sob:");

    args = args.slice(1);//Enlever le pseudo des args
    let muteReason = args.join(" ");
    if(!muteReason) muteReason = "Aucune raison fournie";

    if(muted.roles.cache.get(mutedrole.id)) return message.reply("Cet utilisateur est déjà mute.");

    await muted.send(`Vous avez été mute du serveur **${message.guild.name}** par **${message.author.username}** pour **${muteReason}**`)
        .catch(error => {console.log("Impossible de dm le mute "+message.guild.name+" erreur : "+error)})

    muted.roles.add(mutedrole).then(member => {
        message.reply(`<a:angryping:752201991593394296> **${member.user.username}** a bien été mute par **${message.author.username}** pour **${muteReason}**.`);
    }) .catch(err => {
        message.reply(`Désolé ${message.author} je ne peux pas mute cette personne erreur : ${err}`);
    })
};

module.exports.config = {
    name: "mute",
    description: "Mute quelqu'un du serveur discord.",
    format: "mute <user> [raison]",
    canBeUseByBot: false,
    category: "Moderation",
    permission: Permissions.BAN_MEMBERS,
    needed_args: 1
};
