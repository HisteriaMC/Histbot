const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    client.mysqlingame.query("SELECT * FROM `money` WHERE player = ?", [args[0]], function (err, results){
        if(err) {
            console.error(err);
            message.reply("Erreur");
        }

        if(!results || !results[0]) return message.reply("Aucun joueur trouvé avec ce pseudo");
        let result = results[0];

        message.reply({
            embeds: [{
                title: `Information du joueur **${result.player}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria "+new Date().getFullYear()
                },
                description: `**${result.player}** a **${result.money}$**`
            }]
        })
    })
};

module.exports.config = {
    name: "money",
    description: "Voir la money d'un joueur",
    format: "money <pseudo>",
    alias: ["seemoney", "mymoney"],
    canBeUseByBot: false,
    category: "In Game",
    needed_args: 1,
    iglink: true,
    args: {player: "string"}
};
