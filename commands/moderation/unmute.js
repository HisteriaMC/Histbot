module.exports.run = async(client, message, args) => {
    if(!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
    if(!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    if(!args[0]) return message.reply("Format de la commande : "+module.exports.config.format);

    let muted = message.guild.member(message.mentions.users.first());
    if(!muted) return message.reply("Utilisateur introuvable.");

    let mutedrole = message.guild.roles.cache.find(r => r.name === "Muted");
    if(!mutedrole) return message.reply("Il n'y a pas de role Muted sur ce serveur :sob:");

    if(!muted.roles.cache.has(mutedrole.id)) return message.reply("Cette utilisateur n'est pas mute.");

    await muted.send(`Vous avez été unmute du serveur **${message.guild.name}** par **${message.author.username}** <a:OUI:702130016850411610>`)
        .catch(error => {console.log("Impossible de dm le unmute "+message.guild.name+" erreur : "+error)})

    muted.roles.remove(mutedrole).then(member => {
        message.channel.send(`<a:OUI:702130016850411610> **${member.user.username}** a bien été unmute par **${message.author.username}**`);
    }) .catch(err => {
        message.reply(`Désolé ${message.author} je ne peux pas unmute cette personne parce que : ${err}`);
    })
};

module.exports.config = {
    name: "unmute",
    description: "Unmute quelqu'un du serveur discord.",
    format: "+unmute <user>",
    category: "Moderation",
    canBeUseByBot: false
};
