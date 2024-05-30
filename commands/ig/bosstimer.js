const config = require('../../config.json');

module.exports.run = async(client, message) => {

    message.reply("Chargement des informations...").then(async (msg) => {
        const [faction1, faction2, faction3] = await fetchFactionData(client, message);

        msg.edit({
            content: "",
            embeds: [{
                title: `Informations sur les temps de respawn de boss`,
                color: config.color,
                timestamp: new Date(),
                footer: {
                    icon_url: config.imageURL,
                    text: "@Histeria " + new Date().getFullYear()
                },
                fields: [
                    {
                        name: "Boss faction 1",
                        value: faction1,
                        inline: true
                    },
                    {
                        name: "Boss faction 2",
                        value: faction2,
                        inline: true
                    },
                    {
                        name: "Boss faction 3",
                        value: faction3,
                        inline: true
                    }
                ]
            }]
        });
    });
};

async function fetchFactionData(client, message) {
    let rcon = client.commands.get("rcon");
    const rconFunc = rcon.config.rconfunc;
    const ports = [19101, 19102, 19103];
    const promises = ports.map((port, index) =>
        rconFunc(port, "bosstimer raw", message, port, false)
    );

    try {
        const results = await Promise.allSettled(promises);
        return results.map(result =>
            result.status === 'fulfilled' ? result.value : "Erreur"
        );
    } catch (error) {
        console.error('Error fetching faction data:', error);
        // Handle the error appropriately
        return []; // or re-throw, or handle differently depending on your needs
    }
}

module.exports.config = {
    name: "bosstimer",
    description: "Informations sur les prochains boss",
    format: "bosstimer",
    alias: ["timerboss", "boss"],
    canBeUseByBot: true,
    category: "In Game",
    needed_args: 0
};
