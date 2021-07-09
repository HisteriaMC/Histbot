const config = require("../../config.json");

module.exports.run = async(client, message) => {
    if (message.guild.id !== config.serverid && message.guild.id !== config.serveridjava) return message.channel.send("Pas de ticket sur ce serveur");
    let platform = message.guild.id === config.serverid ? "bedrock" : "java";

    message.guild.channels.create(message.author.username, {
        type: 'text',
        topic: 'Ticket en attente de <@' + message.member.id+'> '+platform,
        permissionOverwrites: [
            {
                id: message.member.id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
            },
            {
                id: message.guild.id === config.serverid ? config.serverid : config.serveridjava,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: platform === "bedrock" ? config.tickets.bedrock.role : config.tickets.java.role,
                allow: ["VIEW_CHANNEL"]
            }
        ],
        parent: message.guild.id === config.serverid ? config.tickets.bedrock.categorywait : config.tickets.java.categorywait, reason: 'Ticket de ' + message.author.tag
    }).then(async c => {
        if (!c) return message.reply("Désolé, il y'a une erreur quelque part");
        let reasons;

        for (const [key, value] of Object.entries(config.tickets.reasons)) {
            if (!reasons) reasons = "**Veuillez réagir avec un émoji en dessous du message concernant votre demande**\n" + key + " " + value;
            else reasons = reasons.concat("\n" + key + " " + value);
        }
        client.log(`Le ticket <#${c.id}> a été ouvert par ${message.author.tag}`,
            message.guild.id === config.serveridjava ? "java" : "bedrock")
        message.reply(`:white_check_mark: Votre Ticket a été créé, <#${c.id}>`);
        let newmsg = await c.send({
            embed: {
                title: `**__Nouveau Ticket__**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.image_url,
                    text: "@Histeria " + new Date().getFullYear()
                },
                fields: [
                    {
                        name: "Sujet du ticket",
                        value: reasons
                    }
                ],
            }
        });
        await newmsg.pin().then( () => {c.messages.fetch({ limit: 1 }).then(messages => {messages.first().delete();})});

        let msgrequest = await c.send('**Veuillez réagir avec un émoji au dessus de ce message pour préciser votre demande**');
        const filter = (reaction) => config.tickets.reasons[reaction.emoji.name];
        const collector = newmsg.createReactionCollector(filter, { time: 300000 });

        let customcollect = 0;
        collector.on('collect', async react => {
            if(react.me) return;
            msgrequest.delete();
            collector.stop();
            customcollect++;
            await reason(newmsg, react, message.author, platform);
        });
        collector.on('end', () => {
            if(customcollect === 0){
                newmsg.channel.send("Absence de plus de 5 minutes, fermeture du ticket dans 5 secondes." +
                    "\nVeuillez réesayer d'ouvrir un ticket et n'oubliez pas de réagir avec une emote sous le message du bot.");
                require("../../sleep.js")(5000);
                newmsg.channel.delete();
                message.author.send("Nous n'avons pas eu de réponse dans votre ticket depuis 5 minutes que vous n'avez pas finir d'ouvrir, le ticket a été fermé."+
                    "\nVeuillez réesayer d'ouvrir un ticket et n'oubliez pas de réagir avec une emote sous le message du bot.")
                    .catch(() => console.log("Impossible de dm le closeur d'un ticket inactif"));
            }
        });
        for (const key of Object.keys(config.tickets.reasons)) {
            if(collector.ended) return;
            if(![config.tickets.bedrock.categorywait, config.tickets.java.categorywait].includes(c.parent.id)) return;
            await newmsg.react(key);
        }
    });
};

async function reason(message, react, author, platform) {
    await message.reactions.removeAll();
    let reason = config.tickets.reasons[react.emoji.toString()];

    //await message.channel.setTopic("1. Ticket ouvert pour " + reason + " par <@" + author.id+">");
    message.edit({
        embed: {
            title: `**__Nouveau Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.image_url,
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
        }
    });

    let msgpseudo = await message.channel.send('**Veuillez répondre ci-dessous avec votre pseudo en jeu (écrivez . si non-nécessaire)**');
    const collector = message.channel.createMessageCollector(m => m.content !== "", { time: 300000 });
    collector.on('collect', m => {
        if(![config.tickets.bedrock.categorywait, config.tickets.java.categorywait].includes(message.channel.parent.id)) return collector.stop();
        msgpseudo.delete();
        pseudo(message, m, reason, author, platform);
        collector.stop();
    });
    collector.on('end', collected => {
        if(![config.tickets.bedrock.categorywait, config.tickets.java.categorywait].includes(message.channel.parent.id)) return;
        if(collected.size === 0){
            message.channel.send("Absence de plus de 5 minutes, fermeture du ticket dans 5 secondes");
            require("../../sleep.js")(5000);
            message.channel.delete();
            author.send("Nous n'avons pas eu de réponse dans le ticket concernant '"+reason+"' que vous n'avez pas finir d'ouvrir pendant 5 minutes, le ticket a été fermé")
                .catch(() => console.log("Impossible de dm le closeur d'un ticket inactif"));
        }
    });
}

async function pseudo(message, response, reason, author, platform){
    response.delete();
    let content;
    if(response.content === ".") content = "Pas de pseudo indiqué";
    else content = response.content;
    content = content.replace('<@', 'TAG_PROTECT');
    //await message.channel.setTopic("2. Ticket ouvert pour " + reason + " par <@" + author.id+"> ("+content+")");
    message.edit({
        embed: {
            title: `**__Nouveau Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.image_url,
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
        }
    });
    let msgdescription = await message.channel.send("**Veuillez indiquer une description approfondie du problème, n'hésitez pas à rajouter des documents par la suite ou des liens**");
    const collector = message.channel.createMessageCollector(m => m.content !== "", { time: 300000 });
    collector.on('collect', desc => {
        if(desc.me) return;
        if(![config.tickets.bedrock.categorywait, config.tickets.java.categorywait].includes(message.channel.parent.id)) return collector.stop;
        msgdescription.delete();
        description(message, reason, content, desc, author, platform);
        collector.stop();
    });
    collector.on('end', collected => {
        if(![config.tickets.bedrock.categorywait, config.tickets.java.categorywait].includes(message.channel.parent.id)) return collector.stop();
        if(collected.size === 0){
            message.channel.send("Absence de plus de 5 minutes, fermeture du ticket dans 5 secondes");
            require("../../sleep.js")(5000);
            message.channel.delete();
            author.send("Nous n'avons pas eu de réponse dans le ticket concernant '"+reason+" que vous n'avez pas finir d'ouvrir pendant 5 minutes, le ticket a été fermé")
                .catch(() => console.log("Impossible de dm le closeur d'un ticket inactif"));
        }
    });
}
async function description(message, reason, pseudo, description, author, platform){
    description.delete();
    let content, categoryid;
    if(description.content === ".") content = "Pas de description indiquée";
    else content = description.content;
    if(content.length > 1023) {
        message.channel.send(content);
        content = "Trop long, envoyé en message";
    }
    categoryid = message.guild.id === config.serveridjava ? config.tickets.java.categoryopened : config.tickets.bedrock.categoryopened;
    await message.channel.edit({
        name: reason??"skip",
        topic: "Ticket ouvert pour " + reason + " par <@" + author.id+"> ("+pseudo+") "+platform,
        parentID: categoryid,
        lockPermissions: false
    }).catch(err => { message.channel.send("<@498159251383123969>"); message.channel.send(err)}); //Hardcoded debug
    //await message.channel.setTopic("Ticket ouvert pour " + reason + " par <@" + author.id+"> ("+pseudo+") "+platform);
    //if(reason !== "skip") await message.channel.setName(reason)
    message.edit({
        embed: {
            title: `**__Nouveau Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.image_url,
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
        }
    });

    description.attachments.forEach(attach => {
       message.channel.send(attach.url);
    });
}


module.exports.config = {
    name: "new",
    description: "Ouvrir un ticket",
    format: "+new [raison]",
    canBeUseByBot: false,
    alias: ["ticket"],
    category: "Ticket",
    restrictchannels: ['743940988413673563', '794597023735087116']
};
