module.exports.run = async(client, message, args) => {
    if(!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
    if(!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    if(!args[0]) return message.reply("Format de la commande : "+module.exports.config.format);

    let muted = message.guild.member(message.mentions.users.first());
    if(!muted) return message.reply("Utilisateur introuvable.");

    let mutedrole = message.guild.roles.cache.find(r => r.name === "Muted");
    if(!mutedrole) return message.reply("Il n'y a pas de role Muted sur ce serveur :sob:");

    args = args.slice(1);//Enlever le pseudo du muted
    let muteReason = args.join(" ");
    if(!muteReason) muteReason = "Aucune raison fournie";

    if(muted.roles.cache.has(mutedrole.id)) return message.reply("Cette utilisateur est déjà mute.");

    await muted.send(`Vous avez été mute du serveur **${message.guild.name}** par **${message.author.username}** pour **${muteReason}** <a:angryping:752201991593394296>`)
        .catch(error => {console.log("Impossible de dm le mute "+message.guild.name+" erreur : "+error)})

    muted.roles.add(mutedrole).then(member => {
        message.channel.send(`<a:angryping:752201991593394296> **${member.user.username}** a bien été mute par **${message.author.username}** pour **${muteReason}**.`);
    }) .catch(err => {
        message.reply(`Désolé ${message.author} je ne peux pas mute cette personne parce que : ${err}`);
    })
};

module.exports.config = {
    name: "mute",
    description: "Mute quelqu'un du serveur discord.",
    format: "+mute <user> [raison]",
    canBeUseByBot: false,
    category: "Moderation"
};
