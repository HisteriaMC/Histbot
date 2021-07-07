module.exports.run = async(client, message, args) => {
    message.delete();
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
    if (!message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    if (!args[0]) return message.channel.send("Vous devez spécifier un nombre de messages à supprimer !");
    let count;
    if (args[0] === "all") count = 100000;

    if (isNaN(args[0]) && args[0] !== "all") return message.channel.send("Veuillez spécifier un nombre !");
    //if (args[0] > 100) return message.channel.send("Discord est méchant et il ne veut pas delete plus de 100 msg");
    if (args[0] < 1) return message.reply("Réfléchit un peu....");
    if(!count) count = args[0];

    let messagesDeleted = await clearChannel(message.channel, 0, false, count);
    message.channel.send(`**${messagesDeleted}** messages supprimés`);

    setTimeout(() => {
        message.channel.messages.fetch({limit: 1}).then(messages => {
            setTimeout(() => {
                let lastmessage = messages.first();
                if (lastmessage && lastmessage.author.id === client.user.id) lastmessage.delete();
            }, 3000)
        });
    }, 200);
};

async function clearChannel(channel, n = 0, old = false, max) { //TODO : Fix cte merde : ça bloque à 100 msg mais le all fonctionne
    let todelete;
    if(max - n < 100) todelete = max - n;
    else todelete = 100;
    if(todelete === 0) return n;

    let collected = await channel.messages.fetch({limit: todelete}).catch(err => console.log(err));
    if (collected.size > 0) {
        if (old) {
            for (let msg of collected.array()) {
                await msg.delete().catch(err => console.log(err));
                n++;
            }
        } else {
            let deleted = await channel.bulkDelete(todelete, true);
            if (deleted.size < collected.size) old = true;
            n += deleted.size;
        }

        return await clearChannel(channel, n, old, max);
    } else return n;
}

module.exports.config = {
    name: "clear",
    description: "Clear des messages",
    format: "+clear <nombre>",
    canBeUseByBot: false,
    category: "Moderation"
};
