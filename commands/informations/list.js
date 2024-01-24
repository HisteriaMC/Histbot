const mcutil = require('minecraft-server-util');
const config = require("../../config.json");

module.exports.run = async(client, message) => {
    mcutil.queryFull('192.168.1.42', {port: config.port, enableSRV: true, timeout: 5000})
        .then((response) => {
            let clean = getCleanPlayers(response.players, stafflist);
            let onlineplayerws = response.onlinePlayers - getStaffOnlinePlayers(response.players, stafflist) // online player without staff
            let d = new Date();

            const title = `Liste de joueurs connectés sur le serveur (${onlineplayerws}/${response.maxPlayers})`;

            switch(clean.type){
                case "message":
                    message.channel.send(title);
                    clean.list.forEach(msg => {message.channel.send(msg);});
                    break;
                case "description":
                    message.channel.send({
                        embeds: [{
                            title: title,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.imageURL,
                                text: "@Histeria " + d.getFullYear()
                            },
                            description: clean.list[0]
                        }]
                    });
                    break;
                case "fields":
                    message.channel.send({
                        embeds: [{
                            title: title,
                            color: config.color,
                            timestamp: new Date(),
                            footer: {
                                icon_url: config.imageURL,
                                text: "@Histeria " + d.getFullYear()
                            },
                            fields: [
                                {
                                    name: "Liste",
                                    value: clean.list[0]
                                }
                            ]
                        }]
                    });
                    break;
            }
        }).catch((error) => {
            message.reply("Erreur lors de la récupération du statut, serveur hors ligne ? `" + error + "`");
        });
};

//Liste des staffs (modérateurs ou +) :
stafflist = [
    "Firekate78",
    "TomGammeur14",
    "RaTzyMc69",
    "SwitAzyaFr",
    "Pixiaxi",
    "Fir3Kaat76",
    "TomGammeur41", 
    "Zeleph_2222", 
    "Quaster2", 
    "Loris_redstone",
    "CercleTour32576", 
    "MaisQuasar14755", 
    "ModItam",
    "dadodasyra",
    "AilfeLirik", 
    "ElfeLyrique640"
]

function getCleanPlayers(players, stafflist)
{
    if(players.length === 0) return {type: "message", list: ["Aucun joueur"]}
    let cleanlist = [];
    let stringplayers = "";
    let stringlist = players.join(", ");
    let type;
    if(stringlist.length < 1024) type = "fields";
    else if(stringlist.length < 1984) type = "description"; //En réalité 2048
    else type = "message";

    players.forEach(player => {
        // Filtrage
        if (!stafflist.includes(player)) {
            if (stringplayers.length > 1984) {
                cleanlist.push(stringplayers.substr(0, stringplayers.length - 2));
                stringplayers = "";
            }
            stringplayers = stringplayers.concat(player + ", ");
        }
    });

    if (stringplayers.length > 0) {
        cleanlist.push(stringplayers.substr(0, stringplayers.length - 2));
    }

    return { type: type, list: cleanlist };
}

function getOnlineStaffCount(players, stafflist) // Sert à avoir le nombre de staffs connectés
{
    let staffCount = 0
    players.forEach(player => {
        // Nombre de staff(s) connecté(s)
        if (stafflist.includes(player)) {
            staffCount += 1
        }
    });

    return staffCount;
}

module.exports.config = {
    name: "list",
    description: "Donne la liste des joueurs connectés au serveur",
    format: "list",
    category: "Informations",
    canBeUseByBot: true,
    delete: true
};
