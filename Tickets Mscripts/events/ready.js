module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('A carregar o módulo de tickets!')
      console.log('Módulo de tickets está agora a funcionar ✔️');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setAuthor('Ticket Panel', client.user.avatarURL())
          .setDescription('**Hi there, welcome to our Ticket System!**\n\n\n For ``General Questions`` click on the <a:1945symbolquestion:996029746964086874>\n\n To ``become a Partner`` click on <a:pinkheart:981886303585062962>\n\n To ``claim Giveaway prizes`` click on <a:2738giveaway:996029750206275714>\n\n In ``case of Bugs or Reports`` click on <a:409toolflat1:996032590316318740>\n\n To ``open our Tebex Shop`` click on <:logozinho:996031426799616071>')
        .setFooter(client.config.footerText, client.user.avatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('general-questions')
          .setLabel('General Questions')
                .setEmoji('996029746964086874')
                .setStyle('SECONDARY'),
            new client.discord.MessageButton()
                .setCustomId('parcerias')
                .setLabel('Partners')
                .setEmoji('981886303585062962')
                .setStyle('SUCCESS'),
            new client.discord.MessageButton()
                .setCustomId('giveaways')
                .setLabel('Giveaways Claim')
                .setEmoji('996029750206275714')
                .setStyle('DANGER'),
            new client.discord.MessageButton()
                .setCustomId('bugs/reports')
                .setLabel('Bugs/Reports')
                .setEmoji('996032590316318740')
                .setStyle('PRIMARY'),
            new client.discord.MessageButton()
                .setLabel('Shop')
                .setURL("Shop")
                .setEmoji('996031426799616071')
                .setStyle('LINK'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Expected channel, got ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};
