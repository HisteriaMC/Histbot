const config = require("../../config.json");
const {TextChannel, MessageActionRow, MessageSelectMenu} = require("discord.js");
let desac = false;

module.exports.run = async(client, message, args) => {
    if (config.owners.includes(message.author.id) && args[0] === "desac") return desac = !desac;
    if (desac) return message.channel.send("Les tickets sont temporairement désactivés probablement dû à une surcharge. Veuillez nous en excuser.");
    if (message.guild.id !== config.serverId) return message.channel.send("Pas de ticket sur ce serveur");

    message.guild.channels.create(message.author.username, {
        type: 'text',
        topic: 'Ticket en attente de <@' + message.member.id+'>',
        permissionOverwrites: [
            {
                id: message.member.id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"]
            },
            {
                id: config.serverId,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: config.tickets.role,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"]
            }
        ],
        parent: config.tickets.categoryWait, reason: 'Ticket de ' + message.author.tag
    }).then(async c => {
        if (!c || !c instanceof TextChannel) return message.reply("Désolé, il y'a une erreur quelque part");
        let reasons;

        for (const [key, value] of Object.entries(config.tickets.reasons)) {
            if (!reasons) reasons = "**Veuillez réagir avec un émoji en dessous du message concernant votre demande**\n" + key + " " + value;
            else reasons = reasons.concat("\n" + key + " " + value);
        }
        client.log(`Le ticket <#${c.id}> a été ouvert par ${message.author.tag}`, 'gen');
        message.reply(`:white_check_mark: Votre Ticket a été créé, <#${c.id}>`); //Send msg in channel of opening

        let options = [];
        for (const [key, value] of Object.entries(config.tickets.reasons)) { //Generate list of options
            options.push({
                label: value,
                value: key
            })
        }
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Choisissez ici le sujet de votre ticket')
                    .addOptions(options),
            );
        let newmsg = await c.send({
            embeds: [{
                title: `**__Nouveau Ticket__**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria " + new Date().getFullYear()
                },
                fields: [
                    {
                        name: "Sujet du ticket",
                        value: "Veuillez choisir dans la menu en dessous le sujet du ticket"
                    }
                ],
            }],
            components: [row]
        });
        await newmsg.pin().then( () => {c.messages.fetch({ limit: 1 }).then(messages => {messages.first().delete();})});

        const collector = newmsg.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 300000 });
        collector.on('collect', async interaction => {
            collector.stop();
            await interaction.deferUpdate();
            await reason(newmsg, config.tickets.reasons[interaction.values[0]], message.author);
        });
        collector.on('end', () => {
            if(!newmsg.channel) return;
            if(collector.collected === 0){
                newmsg.channel.send("Absence de plus de 5 minutes, fermeture du ticket dans 5 secondes." +
                    "\nVeuillez réesayer d'ouvrir un ticket et n'oubliez pas de définir le sujet du ticket.");
                require("../../sleep.js")(5000);
                newmsg.channel.delete();
                message.author.send("Nous n'avons pas eu de réponse dans votre ticket depuis 5 minutes que vous n'avez pas finir d'ouvrir, le ticket a été fermé."+
                    "\nVeuillez réesayer d'ouvrir un ticket et n'oubliez pas de définir le sujet du ticket.");
            }
        });
    });
};

async function reason(message, reason, author, platform) {
    message.edit({
        embeds: [{
            title: `**__Nouveau Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria " + new Date().getFullYear()
            },
            fields: [
                {
                    name: "Sujet du ticket",
                    value: reason
                },
                {
                    name: "Pseudo in game",
                    value: "**Veuillez répondre ci-dessous avec votre pseudo en jeu (écrivez . si non-nécessaire)**"
                }
            ],
        }],
        components: []
    });

    let msgpseudo = await message.channel.send('**Veuillez répondre ci-dessous avec votre pseudo en jeu (écrivez . si non-nécessaire)**');
    const collector = message.channel.createMessageCollector({ filter: m => m.content !== "", time: 300000 });
    collector.on('collect', m => {
        if(config.tickets.categoryWait !== message.channel.parent.id) return collector.stop();
        msgpseudo.delete();
        pseudo(message, m, reason, author, platform);
        collector.stop();
    });
    collector.on('end', collected => {
        if(config.tickets.categoryWait !== message.channel.parent.id) return;
        if(collected.size === 0){
            message.channel.send("Absence de plus de 5 minutes, fermeture du ticket dans 5 secondes");
            require("../../sleep.js")(5000);
            message.channel.delete();
            author.send("Nous n'avons pas eu de réponse dans le ticket concernant '"+reason+"' que vous n'avez pas finir d'ouvrir pendant 5 minutes, le ticket a été fermé")
                .catch(() => console.log("Impossible de dm le closeur d'un ticket inactif"));
        }
    });
}

async function pseudo(message, response, reason, author){
    response.delete();
    let content;
    if(response.content === ".") content = "Pas de pseudo indiqué";
    else content = response.content;
    content = content.replace('<@', 'TAG_PROTECT');
    //await message.channel.setTopic("2. Ticket ouvert pour " + reason + " par <@" + author.id+"> ("+content+")");
    message.edit({
        embeds: [{
            title: `**__Nouveau Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria " + new Date().getFullYear()
            },
            fields: [
                {
                    name: "Sujet du ticket",
                    value: reason
                },
                {
                    name: "Pseudo in game",
                    value: content
                },
                {
                    name: "Description approfondie",
                    value: "**Veuillez indiquer une description approfondie du problème, n'hésitez pas à rajouter des documents par la suite ou des liens**"
                }
            ],
        }]
    });
    let msgdescription = await message.channel.send("**Veuillez indiquer une description approfondie du problème n'hésitez pas à inclure des liens**");
    const collector = message.channel.createMessageCollector({ filter: m => m.content !== "", time: 300000 });
    collector.on('collect', desc => {
        if(desc.me) return;
        if(config.tickets.categoryWait !== message.channel.parent.id) return collector.stop;
        msgdescription.delete();
        description(message, reason, content, desc, author);
        collector.stop();
    });
    collector.on('end', collected => {
        if(config.tickets.categoryWait !== message.channel.parent.id) return collector.stop();
        if(collected.size === 0){
            message.channel.send("Absence de plus de 5 minutes, fermeture du ticket dans 5 secondes");
            require("../../sleep.js")(5000);
            message.channel.delete();
            author.send("Nous n'avons pas eu de réponse dans le ticket concernant '"+reason+" que vous n'avez pas finir d'ouvrir pendant 5 minutes, le ticket a été fermé")
                .catch(() => console.log("Impossible de dm le closeur d'un ticket inactif"));
        }
    });
}
async function description(message, reason, pseudo, description, author){
    description.delete();
    let content, categoryid;
    if(description.content === ".") content = "Pas de description indiquée";
    else content = description.content;
    if(content.length > 1023) {
        message.channel.send(content);
        content = "Trop long, envoyé en message";
    }
    categoryid = config.tickets.categoryOpened;
    await message.channel.edit({
        name: reason??"skip",
        topic: "Ticket ouvert pour " + reason + " par <@" + author.id+"> ("+pseudo+")",
        parent: categoryid,
        lockPermissions: false
    }).catch(err => {
        message.channel.send("Nous sommes actuellement surchargé de ticket, par conséquent le ticket restera en création pour une durée indéterminée");
        message.channel.send(err)});
    //if(reason !== "skip") await message.channel.setName(reason)
    message.edit({
        embeds: [{
            title: `**__Nouveau Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.imageURL,
                text: "@Histeria " + new Date().getFullYear()
            },
            fields: [
                {
                    name: "Sujet du ticket",
                    value: reason
                },
                {
                    name: "Pseudo in game",
                    value: pseudo
                },
                {
                    name: "Description approfondie",
                    value: content
                }
            ],
        }]
    });

    description.attachments.forEach(attach => {message.channel.send("Voici un lien d'un attachment probablement mort: "+attach.url);});
}


module.exports.config = {
    name: "new",
    description: "Ouvrir un ticket",
    format: "new",
    canBeUseByBot: false,
    alias: ["ticket"],
    category: "Ticket"
};
