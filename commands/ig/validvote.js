const hidden = require('../../hidden.json');
const moment = require('moment-timezone');
const fetch = (...args) => import('node-fetch').then(module => module.default(...args))

module.exports.run = async(client, message, args) => {
    let pseudo = args.join("_");

    let link = client.commands.get("link");
    pseudo = await link.parseArg(pseudo, message, client.mysqlingame);

    let rep = await fetch(`https://minecraftpocket-servers.com/api/?object=votes&element=claim&key=${hidden.mcpeToken}&username=${pseudo}`).then(response => response.json());
    if (isNaN(rep)) return message.reply("Erreur 1 !");
    if(rep === 0) return message.reply("Vous n'avez pas voté : http://vote.histeria.fr");
    if(rep === 2) return message.reply("Vous avez déjà voté");
    if(rep !== 1) return message.reply("Erreur !");
    let today = moment().tz("America/New_York").format("DD/MM/YYYY");
    client.mysqlingame.query("SELECT * FROM `voteCalendar` WHERE player = ?", [pseudo], async function (err, results) {
        if (err) {
            console.error(err);
            message.reply("Erreur dans la db");
            return;
        }

        if (!results || !results[0]) return message.reply("Aucun joueur trouvé avec ce pseudo dans la db");
        let result = results[0];

        fetch(`https://minecraftpocket-servers.com/api/?action=post&object=votes&element=claim&key=${hidden.mcpeToken}&username=${pseudo}`).then(() => {
            let yesterday = moment().tz("America/New_York").add(-1, "days").format("DD/MM/YYYY");
            let streak = result["streak"] + 1;
            if (result["lastconsecutive"] === today || result["lastconsecutive"] === yesterday) {
                client.mysqlingame.query("UPDATE voteCalendar SET lastconsecutive = ?, streak = ? WHERE player = ?;", [today, streak, pseudo])
                message.reply("Vous avez maintenant un streak de " + streak)
            } else {
                client.mysqlingame.query("UPDATE voteCalendar SET firstconsecutive = ?, lastconsecutive = ?, streak = ? WHERE player = ?;", [today, today, 1, pseudo])
                message.reply("Vous perdez votre streak, il était à " + streak)
            }
        });
    })
};
module.exports.config = {
    name: "validvote",
    description: "Vérifier et valider votre vote",
    format: "validvote [pseudo]",
    alias: ["verifvote", "voteig", "validationvote", "validevote"],
    canBeUseByBot: false,
    category: "In Game",
    needed_args: 0
};
