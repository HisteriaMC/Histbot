module.exports.run = async(client, message, args) => {
    let letter = 'f';
    if(args[0]) letter = args[0];
    //Check letter is valid
    if(letter.length > 1) return message.channel.send("La lettre doit être une lettre");

    message.reply(`\\*\\*\\<t:`+Math.floor(Date.now() / 1000)+`:${letter}>\\*\\* **<t:`+Math.floor(Date.now() / 1000)+':'+letter+'>**');
};

module.exports.config = {
    name: "timestamp",
    description: "Ecris un timestamp actuel ainsi que son format pur pour affiché une date via discord",
    format: "timestamp [letter]",
    canBeUseByBot: true,
    category: "Utilitaire",
    bypassChannel: true
};
