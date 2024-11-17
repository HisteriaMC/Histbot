const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    //check if already linked
    if (!args[0]) {
        let result = await this.parseArg(args[0], message, client.mysqlingame, true);
        if (!result) return; //error message already sent

        message.reply({
            embeds: [{
                title: `Liaison du joueur **${result.player}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria "+new Date().getFullYear()
                },
                description: `**<@${result.discord}>** est relié à **${result.player}** depuis le **<t:${result.linkedOn}:f>** (<t:${result.linkedOn}:R>)`
            }]
        });
    } else {
        if (args[0] === "remove") {
            let result = await this.getFromDiscordId(client.mysqlingame, message.author.id);
            if (!result) return message.reply("Aucun compte lié à votre discord");

            client.mysqlingame.query("DELETE FROM `discord_link` WHERE discord = ?", [message.author.id], function (err) {
                if (err) {
                    console.error(err);
                    return message.reply("Erreur");
                }

                message.reply({
                    embeds: [{
                        title: `DéLiaison du joueur **${result.player}**`,
                        color: config.color,
                        timestamp: new Date(),
                        footer: {
                            icon_url: config.imageURL,
                            text: "@Histeria "+new Date().getFullYear()
                        },
                        description: `**<@${message.author.id}>** n'est plus relié à **${result.player}**. Il l'était depuis le **<t:${Math.round(Date.now() / 1000)}:f>** (<t:${Math.round(Date.now() / 1000)}:R>)`
                    }]
                });
            });
            return;
        }

        let result = await this.parseArg(args[0], message, client.mysqlingame, true);
        if (!result) result = await this.getFromInGame(client.mysqlingame, args[0]);
        if (!result) {
            //This may be a validation code
            let code = args[0];
            if (code.length === 6) { //this mean player with 6 characters will not work..
                let response = await this.getFromDiscordId(client.mysqlingame, message.author.id);
                if (response) return message.reply("Vous êtes déjà lié à un compte");

                client.mysqlingame.query("SELECT * FROM `discord_verification` WHERE code = ?", [code], function (err, results) {
                    if (err) {
                        console.error(err);
                        return message.reply("Erreur");
                    }

                    if (!results || !results[0]) return message.reply("Aucun code trouvé");
                    let result = results[0];

                    if (result.expire < (Date.now() / 1000)) {
                        client.mysqlingame.query("DELETE FROM `discord_verification` WHERE code = ?", [code]);
                        return message.reply("Code expiré");
                    }

                    let linkedOn = Math.round(Date.now() / 1000);
                    client.mysqlingame.query("INSERT INTO `discord_link` (discord, player, linkedOn) VALUES (?, ?, ?)", [message.author.id, result.player, linkedOn], function (err) {
                        if (err) {
                            console.error(err);
                            return message.reply("Erreur");
                        }

                        client.mysqlingame.query("DELETE FROM `discord_verification` WHERE code = ?", [code]);

                        client.commands.get("refreshrank").run(client, message, ["link"]);

                        message.reply({
                            embeds: [{
                                title: `Liaison du joueur **${result.player}**`,
                                color: config.color,
                                timestamp: new Date(),
                                footer: {
                                    icon_url: config.imageURL,
                                    text: "@Histeria "+new Date().getFullYear()
                                },
                                description: `**<@${message.author.id}>** est désormais relié à **${result.player}**`
                            }]
                        });
                    });
                });
            }
        } else {
            message.reply({
                embeds: [{
                    title: `Liaison du joueur **${result.player}**`,
                    color: config.color,
                    timestamp: new Date(),
                    footer: {
                        icon_url: config.imageURL,
                        text: "@Histeria "+new Date().getFullYear()
                    },
                    description: `**<@${result.discord}>** est relié à **${result.player}** depuis le **<t:${result.linkedOn}:f>** (<t:${result.linkedOn}:R>)`
                }]
            });
        }
    }
};

function getFromInGame(mysql, username) {
    return new Promise((resolve, reject) => {
        mysql.query("SELECT * FROM `discord_link` WHERE player = ?", [username], function (err, results) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            if (!results || !results[0]) {
                resolve(null);
                return;
            }
            resolve(results[0]);
        })
    })
}

function getFromDiscordId(mysql, id) {
    return new Promise((resolve, reject) => {
        mysql.query("SELECT * FROM `discord_link` WHERE discord = ?", [id], function (err, results) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            if (!results || !results[0]) {
                resolve(null);
                return;
            }
            resolve(results[0]);
        })
    })
}

async function parseArg(arg, message, mysql, fullResult = false) {
    if (!arg) {
        let result = await this.getFromDiscordId(mysql, message.author.id);
        if (!result) {
            message.reply("Aucun compte lié à votre discord, pour en lier un veuillez utiliser `/link` en jeu.");
            return null;
        }

        return fullResult ? result : result.player;
    } else {
        //replace <@!id> to id
        arg = arg.replace(/<@!?(\d+)>/g, "$1");
        let target = message.guild.members.cache.get(arg);
        if (target) {
            let result = await this.getFromDiscordId(mysql, target.id);
            if (!result) {
                message.reply("Aucun compte lié au discord de " + target.user.username);
                return null;
            }

            return fullResult ? result : result.player;
        } else if (!fullResult) return arg;
    }
}

module.exports.config = {
    name: "link",
    description: "Relier votre compte discord à votre compte en jeu",
    format: "link [pseudo/remove]",
    alias: ["relier", "lier", "linked"],
    canBeUseByBot: false,
    category: "In Game",
    iglink: true,
    needed_args: 0,
    args: {pseudo: "string"},
};

module.exports.getFromDiscordId = getFromDiscordId;
module.exports.getFromInGame = getFromInGame;
module.exports.parseArg = parseArg;
