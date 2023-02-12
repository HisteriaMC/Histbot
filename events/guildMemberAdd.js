const config = require("../config.json");

module.exports = (client, member) => {
    let channel = member.guild.channels.cache.get(config.welcome);
    if(!channel) return;
    channel.send(`**[<a:ANNONCE:700068339929710693>]** ${member.user} vient de rejoindre Histeria`);
};