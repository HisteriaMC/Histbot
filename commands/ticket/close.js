const moment = require("moment");
moment.locale("fr");
const config = require("../../config.json");
const Discord = require("discord.js");
const fs = require('fs');
const path = require("path");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
this.indeleting = {};

module.exports.run = async(client, message) => {
    if (!message.channel.parent || !config.tickets.allchannels.includes(message.channel.parent.id)) return message.reply("Cette commande est à exécuter dans un ticket.");

    let d = new Date();//Hardcoded anti spam
    if(this.indeleting[message.channel.id] && this.indeleting[message.channel.id] > Date.now()) return message.reply("Une autre commande de close est en cours d'execution");

    let newmsg = await message.channel.send({
        embeds: [{
            title: `**__Close Ticket__**`,
            color: config.color,
            timestamp: new Date(),
            footer: {
                icon_url: config.image_url,
                text: "@Histeria " + new Date().getFullYear()
            },
            description: ":question: Voulez vous vraiment fermer ce ticket, confirmez avec la réaction ci-dessous"
        }]
    });
    let emotecloseid = config.tickets.emoteclose.split(":")[2].replace(">", "");

    await newmsg.react(emotecloseid);
    const filter = (reaction) => reaction.emoji.id === emotecloseid;
    const collector = newmsg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async react => {
        d = new Date()
        collector.stop();
        this.indeleting[message.channel.id] = Date.now() + 10000;
        newmsg.edit({
            embeds: [{
                title: `**__Close Ticket__**`,
                color: config.color,
                timestamp: d,
                footer: {
                    icon_url: config.image_url,
                    text: "@Histeria " + new Date().getFullYear()
                },
                description: "Suppression du salon dans 5 secondes..."
            }]
        });
        react.remove();
        await newmsg.react(config.idees.emoteno);
        const filter = (reaction) => reaction.emoji.id === config.idees.emoteno.split(":")[2].replace(">", "");

        const collector2 = newmsg.createReactionCollector({filter,  time: 7000 });
        collector2.on('collect', async (react, user) => {
            d = new Date()
            newmsg.edit({
                embed: {
                    title: `**__Close Ticket__**`,
                    color: config.color,
                    timestamp: d,
                    footer: {
                        icon_url: config.image_url,
                        text: "@Histeria " + new Date().getFullYear()
                    },
                    description: "Suppression annulée par "+user.username
                }
            })
            react.remove();
            collector2.stop()
        });
        let transcriptname = require('crypto').randomBytes(3).toString('hex');
        while(fs.existsSync(transcriptname)){
            transcriptname = require('crypto').randomBytes(3).toString('hex');
        }

        await createTranscript(message, transcriptname, client);
        await require("../../sleep")(5000)
        if(newmsg.embeds[0].description.includes("annulée")) {
            fs.unlinkSync(config.tickets.pathtranscripts + transcriptname + '.html');
            return;
        }

        let channelname = message.channel.name;
        let topic = message.channel.topic;
        if(!topic) topic = "";
        let splitted = topic.split('@').pop();
        splitted = splitted.split('>').shift();
        let user = await client.users.fetch(splitted).catch(() => console.error("Erreur lors du get de l'utilisateur qui ferme ticket"));
        let username, id, name;
        if(user) {
            id = user.id;
            username = user.username;
        } else {
            id = message.author.id;
            username = message.author.username;
        }
        name = channelname === username ? "Inconnu" : channelname;

        client.mysql.execute('INSERT INTO `transcripts` VALUES (?, ?, ?, ?)',
            [transcriptname, name, id, username]);
        message.channel.delete();
        client.log(`Le ticket '${channelname}' de ${user?.tag||"introuvable"} a été fermé par ${message.author.tag} `+
            `https://transcripts.histeria.fr/${transcriptname}`, "gen");
        if(!user) return;
        let bywho = "";
        if(user.id !== message.author.id) bywho = " par "+message.author.tag;
        user.send({
            embeds: [{
                title: `**__Close Ticket__**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.image_url,
                    text: "@Histeria " + new Date().getFullYear()
                },
                description: `Votre ticket '${channelname}' a bien été supprimé`+bywho+
                    '\nVous pouvez accéder à un transcript de votre ticket via [ce lien](https://transcripts.histeria.fr/'+transcriptname+')'
            }]
        }).catch(() => console.log("Impossible de dm le closeur d'un ticket"));
    });
    collector.on('end', collected => {
        if(config.tickets.categorywait !== message.channel.parent?.id) return;
        if(collected.size === 0) newmsg.channel.send("Absence de plus de 1 minute, annulation");
    });
};

async function createTranscript(message, transcriptname, client) { //Tests
    const dom = new JSDOM(fs.readFileSync(path.resolve(__dirname, './template/template.html'), 'utf8'));
    const document = dom.window.document;

    let messageCollection = new Discord.Collection();
    let channelMessages = await message.channel.messages.fetch({limit: 100}).catch(err => console.log(err));

    messageCollection = messageCollection.concat(channelMessages);

    while (channelMessages.size === 100) {
        let lastMessageId = channelMessages.lastKey();
        channelMessages = await message.channel.messages.fetch({
            limit: 100,
            before: lastMessageId
        }).catch(err => console.log(err));
        if (channelMessages)
            messageCollection = messageCollection.concat(channelMessages);
    }
    let msgs = Array.from(messageCollection.values()).reverse();
    let body = document.body;

    let finalmsgs = [];
    for (const msg of msgs) {
        let content = msg.content;
        let embed = replaceembeds(msg.embeds);
        let attachments = replaceattachments(msg.attachments);
        content = replacemarkdown(content);
        content = replacelinks(content);
        content = replacementions(msg.mentions, content, true);
        content = replaceemotes(content);

        let code = '';
        if (content.startsWith("```")) {
            code = content.replace(/```/g, "").replace(/\n/g, "<br>");
            content = '';
        }

        let finalmsg = {
            img: msg.author.avatarURL()??'https://external-preview.redd.it/4PE-nlL_PdMD5PrFNLnjurHQ1QKPnCvg368LTDnfM-M.png?auto=webp&s=ff4c3fbc1cce1a1856cff36b5d2a40a6d02cc1c3',
            pseudo: msg.author.username,
            date: moment.utc(msg.createdAt).format("LLL"),
            text: content.replace(/\n/g, "<br>"),
            images: attachments.images,
            files: attachments.files,
            embed: embed,
            code: code
        };
        finalmsg.embed = embed;
        finalmsgs.push(finalmsg);
    }

    let script = document.createElement("script");

    let topic = message.channel.topic;
    if(!topic) topic = "";

    topic = topic.replace("'", '');
    let splitted = topic.split('@').pop();
    splitted = splitted.split('>').shift();

    let user = await client.users.fetch(splitted).catch(() => console.error("Erreur lors du get de l'utilisateur qui ferme ticket"));
    let descmentions = {users: [user]};

    let vue = "new Vue({el: '#app', " +
        "data: {" +
        "header: " +
        "{servername:'"+message.guild.name+"', " +
        "channelname:'#"+message.channel.name+"', " +
        "channeldescription:'"+replaceescape(replacementions(descmentions, topic))+"', " +
        "serverimg: '"+message.guild.iconURL({format: "png"})+"'}, " +

        "messages: "+JSON.stringify(finalmsgs)+"}}); ";
    script.append(vue);
    body.appendChild(script);

    await fs.writeFileSync(config.tickets.pathtranscripts + transcriptname + '.html', document.documentElement.outerHTML); //Enregistrer l'entête du serveur
}
function replaceescape(content)
{
    content = content.replace("'", "\'");
    return content.replace('"', "\"");
}
function replacementions(mentions, content, insertstrong = false)
{
    let toreplace;
    if(mentions.users)
    mentions.users.forEach(mention => {
        if(!mention) return content;
        if(!mention.username) return content;
        insertstrong ? toreplace = "<strong>@" + mention.username + "</strong>" : toreplace = "@" + mention.username;
        let replace = content.replace("<@"+mention.id+">", toreplace);
        content === replace ? content = content.replace("<@!"+mention.id+">", toreplace) : content = replace;
    });
    if(mentions.roles)
    mentions.roles.forEach(mention => {
        insertstrong ? toreplace = "<strong>@" + mention.name + "</strong>" : toreplace = "@" + mention.name;
        content = content.replace("<@&" + mention.id + ">", toreplace);
    });
    if(mentions.channels)
    mentions.channels.forEach(mention => {
        insertstrong ? toreplace = "<strong>#" + mention.name + "</strong>" : toreplace = "#" + mention.name;
        content = content.replace("<#" + mention.id + ">", toreplace);
    });
    return content;
}

function replaceemotes(content)
{
    let emotes = content.match(/<a*:[^:\s]*(?:[^:\s]*)*:\d+>/g);
    if(!emotes) return content;
    let alt, fakecontent = content;
    emotes.forEach(emote => {fakecontent = fakecontent.replace(emote, "");}); //Detect for the scale
    if(fakecontent === '' && emotes.length < 5) alt = 'bigEmote';
    else alt = "smallEmote";
    emotes.forEach(emote => {
        let id = emote.split(":")[2].replace(">", "");
        content = content.replace(emote, ' <img src="https://cdn.discordapp.com/emojis/' +
            id + '" alt="' + alt + '"> ');
    });
    return content;
}
function replaceattachments(attachments)
{
    let files = [], images = [];
    attachments.forEach(attachment => {
        let extensionfile = attachment.name.split(".");
        extensionfile = extensionfile[extensionfile.length - 1];
        if(["jpg", "png", "jpeg", "jfif", "pjpeg", "pjp", "gif", "apng", "bmp", "ico", "svg", "tif", "tiff", "webp"].includes(extensionfile.toLowerCase())){
            images.push(attachment.url)
        } else {
            let size = attachment.size;
            if(size > 1000000) size = Math.round(size/1000000 * 100) / 100+" MB"//1 000 000 = 1 mo
            else if (size > 1000) size = Math.round(size/1000 * 100) / 100+" KB" //1 000 = 1 ko
            else size = size + " B";
            files.push({name: attachment.name, size: size, link: attachment.url})
        }
    });
    return {files, images};
}

function replaceembeds(embeds)
{
    let notembed = embeds[0];
    let embed = "";
    if (notembed) {
        let embedcontent = [];
        if (!notembed.fields[0] && notembed.description) {
            embedcontent = [{title: "", text: notembed.description.replace(/\n/g, "<br>")}];
        } else {
            notembed.fields.forEach(field => {
                embedcontent.push({title: replacemarkdown(field.name.replace(/\n/g, "<br>")), text: replacemarkdown(field.value.replace(/\n/g, "<br>"))});
            });
        }
        if(!notembed.title) notembed.title = "";
        embed = {title: replacemarkdown(notembed.title), content: embedcontent};
    }
    return embed;
}
function replacelinks(content)
{
    let links = content.match(/(http|https):\/\/+([\w_-]+((?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g);
    if(links){
        links.forEach(link => {
            content = content.replace(link, '<a href="'+link+'">'+link+'</a>');
        });
    }
    return content;
}
function replacemarkdown(content)
{
    let foundsbold = content.match(/\*\*([^]*?)\*\*/g);
    if(foundsbold)
    foundsbold.forEach(found => {
        content = content.replace(found, `<b>${found.replace(/\*/g, '')}</b>`)
    });

    let foundshighlighted = content.match(/__([^]*?)__/g);
    if(foundshighlighted)
    foundshighlighted.forEach(found => {
        content = content.replace(found, `<under>${found.replace(/_/g, '')}</under>`)
    });
    return content;
}
module.exports.config = {
    name: "close",
    description: "Close un ticket",
    format: "close",
    alias: ["fermer"],
    canBeUseByBot: false,
    category: "Ticket",
    bypassChannel: true
};
