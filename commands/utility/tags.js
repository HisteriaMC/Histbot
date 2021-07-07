const config = require("../../config.json");

module.exports.run = async(client, message, args) => {
    let tagname;
    if (args[0] && args[0] === "create") {
        tagname = args[1];
        if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
        if (!config.rcon.servers.includes(message.guild.id)) return message.reply("Les tags ne sont pas disponible sur ce serveur");
        if (!tagname) return message.reply("Il manque le nom du tag a créer : "+this.config.format);
        if (!args[2]) return message.reply("Il manque le contenu du tag à créer : "+this.config.format)
        args = args.splice(2);

        if (client.tags.get(tagname)) return message.reply("Ce tag existe déjà");
        client.tags.set(tagname, args.join(" "));
        client.mysql.execute("INSERT INTO `tags` (tag, content) VALUES(?, ?);", [tagname, args.join(" ")]);
        message.reply("Le tag au nom de `"+tagname+"` a été créé avec pour contenu `"+args.join(" ")+"`");
    } else if(args[0] && ["delete", "remove"].includes(args[0])) {
        tagname = args[1];
        if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
        if (!config.rcon.servers.includes(message.guild.id)) return message.reply("Les tags ne sont pas disponible sur ce serveur");

        if (!client.tags.get(tagname)) return message.reply("Ce tag n'existe pas");
        client.tags.delete(tagname);
        client.mysql.execute("DELETE FROM `tags` WHERE tag = ?;", [tagname]);
        message.reply("Le tag au nom de `"+tagname+"` a été supprimé");
    } else {
        tagname = args[0];
        if(!tagname) {
            let list = [];
            client.tags.forEach((value, key) => {list.push(key);});
            message.reply("Voici la liste des tags : "+list.join(", "));
        } else {
            message.delete();
            if (!client.tags.get(tagname)) return message.reply("Ce tag n'existe pas");
            message.channel.send(client.tags.get(tagname));
        }
    }
};

module.exports.config = {
    name: "tags",
    description: "Création de tag, messages préfait pour les guides de chaque ",
    format: "+tag <create/delete/name> [name] [content]",
    alias: ["tag"],
    canBeUseByBot: false,
    category: "Utilitaire"
};
