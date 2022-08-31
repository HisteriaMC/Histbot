const Discord = require('discord.js');
/*const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');*/
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const {Permissions} = require("discord-api-types/v10");
const client = new Client({ intents: 3276799 }); //38734
const fs = require('fs');
const mysql = require('mysql2');
const config = require("./config.json");
const hidden = require("./hidden.json");
const xpmanager = require("./xpmanager");
const path = require("path");

//let commandstoregister = [];
client.commands = new Discord.Collection();
client.mysql = mysql.createConnection({
    host: hidden.mysql.host,
    user: hidden.mysql.user,
    database: hidden.mysql.schema,
    password: hidden.mysql.password
});
client.mysqlminicore = mysql.createConnection({
    host: hidden.mysql.host,
    user: hidden.mysql.user,
    database: 'minicore',
    password: hidden.mysql.password
});
client.backgrade = mysql.createConnection({
    host: hidden.mysql.host,
    user: hidden.mysql.user,
    database: 'back',
    password: hidden.mysql.password
});
client.tags = new Discord.Collection();
client.autorespond = new Discord.Collection();
client.xpapi = new xpmanager.xpmanager(client);

async function start() {
    loadtags();
    loadautorespond();

    fs.readdir(path.resolve(__dirname, './events/'), (error, f) => {
        if (error) {
            return console.error(error);
        }

        f.forEach((f) => {
            let events = require(`./events/${f}`);
            let event = f.split('.')[0];
            client.on(event, events.bind(null, client));
        });
        console.log(`${f.length} events chargés`);
    });

    await client.login(hidden.token).catch(error => console.log("Erreur de connexion : " + error));
    await loadcommands();
}
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}
async function loadcommands() {
    let f = fs.readdirSync(path.resolve(__dirname, './commands/'));
    let commands = f.filter(f => f.split('.').pop() === 'js');
    let total = 0;

    commands.forEach((f) => { //useless (commandes à la racine)
        let cmd = require(`./commands/${f}`);
        loadcommand(cmd);
    });

    let directories = getDirectories(path.resolve(__dirname, './commands/'));

    for (const direct of directories) {
        let filedirect = await fs.readdirSync(path.resolve(__dirname, './commands/' + direct));
        let commandsdirect = filedirect.filter(filedirect => filedirect.split('.').pop() === 'js');
        commandsdirect.forEach((f) => {
            let cmd = require(`./commands/${direct}/${f}`);
            loadcommand(cmd);
            /*let conf = cmd.config;
            if(conf.category !== "hidden"){
                let slashcmd = new SlashCommandBuilder()
                    .setName(conf.name)
                    .setDescription(conf.description);
                if (conf.needed_args) {
                    for (let i = 1; conf.needed_args >= i; i++) {
                        slashcmd = slashcmd.addStringOption(option => option.setName("arg_" + i).setDescription("Un argument obligatoire").setRequired(true));
                    }
                }
                commandstoregister.push(slashcmd.toJSON());
            }*/
            total++;
        });
    }
    /*const rest = new REST({version: '9'}).setToken(hidden.token);

    await (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(client.user.id, "589373751359963146"),
                {body: commandstoregister},
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();*/
    console.log(total+" commandes chargés");
}
function loadcommand(commande)
{
    client.commands.set(commande.config.name, commande);
    if (commande.config.alias) {
        commande.config.alias.forEach((ali) => {
            client.commands.set(ali, commande);
        });
    }
}
function loadtags()
{
    client.mysql.query('SELECT * FROM `tags`;', function(err, results) {
        if(!results) return;
        results.forEach(row => {
            client.tags.set(row["tag"], row["content"]);
        });
    });
}
function loadautorespond()
{
    client.mysql.query('SELECT * FROM `autorespond`;', function(err, results) {
        if(!results) return;
        results.forEach(row => {
            if(row["server"] === config.serverId) client.autorespond.set(row["autorespond"], row["content"]);
        });
    });
}
process.stdin.resume();
client.log = async function log(message, platform = "all") {
    let channelid;
    switch (platform) {
        case "gen": case "general": channelid = config.logs; break;
        case "staff": channelid = config.logsStaff; break;
        default: case "all": channelid = config.logsStaff;break;
    }

    let channel = client.channels.cache.get(channelid);
    if (!channel) {
        channel = await client.channels.resolve(channelid);
        if (!channel) return console.log("Pas de salon de log trouvé pour " + platform + " avec pour ID " + channelid);
    }
    let d = new Date();
    channel.send(`**${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}** ${message}`);
}

async function exitHandler(options, exitCode) {
    console.log(`Bot down pour ${exitCode}`)
    client.log(`Bot down pour ${exitCode}`)
    if (options.cleanup) {
        await client.xpapi.save();
        return;
    }
    if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));//Ctrl+C
process.on('SIGUSR1', exitHandler.bind(null, {exit:true})); //KILL PID
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', function (exception) {
    console.log(exception)
    exitHandler({exit: true}, exception.message+"\n"+exception.stack);
}); //ERreur non log
start();