const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban someone.')
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Member to ban')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
      .setDescription('Reason of the Ban')
      .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('target').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({
      content: 'The bot or the user has not permission to use this command! Requirements: ! (`BAN_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'The person that you tried to ban is a superior of yours, you cannot ban him.',
      ephemeral: true
    });

    if (!user.bannable) return interaction.reply({
      content: 'This user is a superior of yours or the bot has no permissions to ban.',
      ephemeral: true
    });

    if (interaction.options.getString('raison')) {
      user.ban({
        reason: interaction.options.getString('raison'),
        days: 1
      });
      interaction.reply({
          content: `**${user.user.tag}** Has been banned from the server 😎 !`
      });
    } else {
      user.ban({
        days: 1
      });
      interaction.reply({
          content: `**${user.user.tag}** Has been banned from the server 😎 !`
      });
    };
  },
};