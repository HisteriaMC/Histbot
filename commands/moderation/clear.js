module.exports.run = async(client, message, args) => {
    //if (!message.guild.members.cache.get(client.user).permissions.has("MANAGE_MESSAGES")) return message.channel.send("Je n'ai pas la permission !").catch(console.error);

    let count;
    if (args[0] === "all") count = 100000;
    if (isNaN(args[0]) && args[0] !== "all") return message.channel.send("Veuillez spécifier un nombre !");
    //if (args[0] > 100) return message.channel.send("Discord est méchant et il ne veut pas delete plus de 100 msg");
    if (args[0] < 1) return message.reply("Réfléchit un peu....");
    if(!count) count = args[0]++;

    let messagesDeleted = await clearChannel(message.channel, count);
    message.channel.send(`**${messagesDeleted}** messages supprimés`);

    setTimeout(() => {
        message.channel.messages.fetch({limit: 1}).then(messages => {
            setTimeout(() => {
                let lastmessage = messages.first();
                if (lastmessage && lastmessage.author.id === client.user.id) lastmessage.delete();
            }, 3000);
        });
    }, 200);
};

async function clearChannel(channel, max) {
    let n = 0, fetched, todelete;

    do {
        if(max >= 100) todelete = 100;
        else if(max < 100) todelete = max;
        fetched = await channel.messages.fetch({limit: todelete});
        if(fetched.size === 0) break;
        let deleted = await channel.bulkDelete(fetched, true).catch();
        n += deleted.size;
    }
    while(max < n);
    return n;
}

module.exports.config = {
    name: "clear",
    description: "Clear des messages",
    format: "clear <nombre>",
    canBeUseByBot: false,
    category: "Moderation",
    delete: true,
    permission: "MANAGE_MESSAGES",
    needed_args: 1
};
