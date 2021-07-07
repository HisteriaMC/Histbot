const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const mysql = require('mysql2');
const config = require("./config.json");
const xpmanager = require("./xpmanager");
const path = require("path");
client.commands = new Discord.Collection();
client.mysql = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    database: config.mysql.schema,
    password: config.mysql.password
});
client.mysqlminicore = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    database: 'minicore',
    password: config.mysql.password
});
client.tags = new Discord.Collection();
client.xpapi = new xpmanager.xpmanager(client);

function start(){
    loadcommands();
    loadtags();

    fs.readdir(path.resolve(__dirname, './events/'), (error, f) => {
        if (error) { return console.error(error); }

        f.forEach((f) => {
            let events = require(`./events/${f}`);
            let event = f.split('.')[0];
            client.on(event, events.bind(null, client));
        });
        console.log(`${f.length} events chargés`);
    });

    client.login(config.token).catch(error => console.log("Erreur de connexion : "+error));
}
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}
function loadcommands() {
    fs.readdir(path.resolve(__dirname, './commands/'), async (error, f) => {
        if (error) {
            return console.error(error);
        }
        let commands = f.filter(f => f.split('.').pop() === 'js');
        let total = 0;

        commands.forEach((f) => {
            loadcommand(`./commands/${f}`);
        });

        let directories = getDirectories(path.resolve(__dirname, './commands/'));
        await directories.forEach((direct) => {
            fs.readdir(path.resolve(__dirname, './commands/' + direct), (error, filedirect) => {
                let commandsdirect = filedirect.filter(filedirect => filedirect.split('.').pop() === 'js');
                commandsdirect.forEach((f) => {
                    loadcommand(`./commands/${direct}/${f}`);
                    total = total + 1;
                });
            });
        });
    });
}
function loadcommand(path)
{
    let commande = require(path);
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
        results.forEach(row => {
            client.tags.set(row["tag"], row["content"]);
        });
    });
}
process.stdin.resume();
client.log = function log(message, platform = "all")
{
    let channels = [];
    switch (platform) {
        case "java": channels.push(config.logsjava); break;
        case "bedrock": channels.push(config.logsbedrock); break;
        case "staff": channels.push(config.logsstaff); break;
        default: case "all": channels.push(config.logsjava); break;
    }

    channels.forEach(channelid => {
        let channel = client.channels.cache.get(channelid);
        if(!channel) {
            channel = client.channels.resolve(channelid);
            if(!channel) return console.log("Pas de salon de log trouvé pour "+platform);
        }
        let d = new Date();
        channel.send(`**${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}** ${message}`);
    });
}

async function exitHandler(options, exitCode) {
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
process.on('uncaughtException', exitHandler.bind(null, {exit:true})); //ERreur non log
start();