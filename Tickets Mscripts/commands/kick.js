const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a person.')
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Member to kick')
      .setRequired(true))
    .addStringOption(option =>
        option.setName('raison')
        .setDescription('Reason to kick')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('target').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({
      content: 'You or the bot has no permissions to kick the member! Requirements: (`KICK_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'The member that you tried to kick is a superior of yours, you cannot kick him!',
      ephemeral: true
    });

    if (!user.kickable) return interaction.reply({
      content: 'The person that you tried to kick is a superior of yours, you cannot kick him!',
      ephemeral: true
    });

    if (interaction.options.getString('raison')) {
      user.kick(interaction.options.getString('raison'))
      interaction.reply({
        content: `**${user.user.tag}** The kick has been made with sucess !`
      });
    } else {
      user.kick()
      interaction.reply({
        content: `**${user.user.tag}** The kick has been made with sucess !`
      });
    };
  },
};