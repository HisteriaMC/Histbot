const hidden = require("../../hidden.json");
const {PermissionFlagsBits} = require("discord-api-types/v10");

module.exports.run = async (client, message, args) => {
    if (!hidden.rcon.servers.includes(message.channel.guild.id))
        return message.channel.send("Petit malin va ! Tu croyais me berner comme ça");

    let link = client.commands.get("link");
    let username = await link.parseArg(args[0], message, client.mysqlingame);

    client.mysqlingame.query('SELECT * FROM ban WHERE player = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return message.channel.send('Une erreur s\'est produite lors de la recherche du joueur banni.');
        }

        if (!results || results.length === 0) {
            return message.channel.send('Ce joueur n\'est pas banni.');
        }

        client.mysqlingame.query('DELETE FROM ban WHERE player = ?', [username], (err) => {
            if (err) {
                console.error(err);
                return message.channel.send('Une erreur s\'est produite lors du débannissement du joueur.');
            }

            message.channel.send(`Le joueur ${username} a été débanni avec succès !`);
        });
    });
};

module.exports.config = {
    name: 'tpardon',
    description: 'Deban un joueur en jeu',
    format: 'tpardon <pseudo>',
    canBeUseByBot: false,
    category: 'Moderation',
    alias: ['pardon', 'tunban'],
    permission: PermissionFlagsBits.BanMembers,
    needed_args: 1,
    args: { pseudo: 'string' }
};