const config = require("../config.json");
const {InteractionType} = require("discord-api-types");

module.exports = (client, interaction) => {
    if(interaction.member.id === client.user.id) return;
    if (interaction.channel.type === 'DM') return;
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    let args = interaction.options;
    let commande = interaction.commandName;
    let cmd = client.commands.get(commande);

    if (!cmd) return;
    let conf = cmd.config;
    if (conf.permission && !interaction.member.permissions.has(conf.permission)) return interaction.reply("Vous n'avez pas la permission d'utiliser cette commande");
    if (interaction.member.bot && !conf.canBeUseByBot) return;
    if (interaction.guild.id === config.serverid
        && interaction.channel.id !== config.commandchannel
        && !interaction.member.permissions.has("MANAGE_MESSAGES")
        && !conf.bypassChannel) return;
    if (conf.delete) interaction.delete();

    cmd.run(client, interaction, args);
};
