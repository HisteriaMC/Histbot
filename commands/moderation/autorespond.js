const config = require("../../config.json");
const hidden = require("../../hidden.json");

module.exports.run = async(client, message, args) => {
    let autorespondname, serverid;

    if(["delete", "remove"].includes(args[0])) {
        autorespondname = args[1];
        if (!autorespondname) return message.reply("Il manque un argument. Format: "+config.prefix + config.format);
        if (!hidden.rcon.servers.includes(message.guild.id)) return message.reply("Les autorespond ne sont pas disponible sur ce serveur");

        if (!client.autorespond.get(autorespondname)) return message.reply("Cet autorespond n'existe pas");
        client.autorespond.delete(autorespondname);
        client.mysql.execute("DELETE FROM `autorespond` WHERE autorespond = ?;", [autorespondname]);
        message.reply("Le autorespond au nom de `"+autorespondname+"` a été supprimé");
    } else if(args[0] === "list"){
        let list = [];
        client.autorespond.forEach((value, key) => {list.push(key);});
        message.reply("Voici la liste des autoresponds : `"+list.join(", ")+"`");
    } else {
        autorespondname = args[1]?.toLowerCase();
        if (!autorespondname) return message.reply("Il manque un argument. Format: "+config.prefix + config.format);
        if (![config.serverid, config.staffserverid].includes(message.guild.id)) return message.reply("L'autorespond n'est pas disponible sur ce serveur");
        if(message.guild.id === config.staffserverid) serverid = config.serverid; //Si serveur de staff = autoresponse serv principal
        if (!args[2]) return message.reply("Il manque le contenu de l'autorespond à créer : "+this.config.format)
        args = args.splice(2);

        if (client.autorespond.get(autorespondname)) return message.reply("Cet autorespond existe déjà");
        client.autorespond.set(autorespondname, args.join(" "));
        client.mysql.execute("INSERT INTO `autorespond` (server, autorespond, content) VALUES(?, ?, ?);", [serverid ?? message.guild.id, autorespondname, args.join(" ")]);
        message.reply("Autorespond créé !");
    }
};

module.exports.config = {
    name: "autorespond",
    description: "Création d'autorespon avec des messages préfaits",
    format: "autorespond <create/delete/name/list> [name] [content]",
    canBeUseByBot: false,
    category: "Moderation",
    permission: "MANAGE_MESSAGES",
    needed_args: 1,
    args: {
        sub_args: {
            create: {name: "string", content: "string"},
        }
    }
};
