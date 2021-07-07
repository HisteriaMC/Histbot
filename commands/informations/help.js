const config = require("../../config.json");

module.exports.run = async(client, message) => {
    let fields = [];
    let values = {};
    let noalias = [];
    client.commands.forEach(command => {
        let name = command.config.name;
        let toadd = "**"+command.config.format+"** "+command.config.description;
        if(noalias.includes(name) || command.config.category === "hidden") return;
        noalias.push(name);

        if(values[command.config.category]) values[command.config.category] = values[command.config.category].concat("\n"+toadd);
        else values[command.config.category] = toadd;
    });
    for(const category in values){
        fields.push({name: category, value: values[category]});
    }

    let d = new Date();
    await message.channel.send({
        embed: {
            title: `__Liste des commandes disponibles__`,
            color: config.color,
            timestamp: d,
            footer: {
                icon_url: config.image_url,
                text: "@Histeria "+d.getFullYear()
            },
            fields: fields
        }
    })
};

module.exports.config = {
    name: "help",
    description: "Voir la liste des commandes disponible",
    format: "+help",
    category: "Informations",
    canBeUseByBot: true
}