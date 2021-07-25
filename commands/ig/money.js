const config = require('../../config.json');

module.exports.run = async(client, message, args) => {
    if(!args[0]) return message.reply("Il manque la personne a récupéré");
    client.mysqlminicore.query("SELECT * FROM `money` WHERE userName = ?", [args[0]], function (err, results){
        if(err) {
            console.error(err);
            message.reply("Erreur");
        }

        if(!results || !results[0]) return message.reply("Aucun membre trouvé avec ce pseudo");
        let result = results[0];

        message.reply({
            embed: {
                title: `Information du joueur **${result.username}**`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.image_url,
                    text: "@Histeria "+new Date().getFullYear()
                },
                description: `${result.username} a ${result.money}$`
            }
        })
    })

};

module.exports.config = {
    name: "money",
    description: "Voir la money d'un joueur",
    format: "+money <pseudo>",
    alias: ["seemoney", "mymoney"],
    canBeUseByBot: false,
    category: "In Game"
};
