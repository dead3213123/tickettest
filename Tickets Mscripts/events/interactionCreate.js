let hastebin = require('hastebin');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId == "general-questions") {

            if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
                return interaction.reply({
                    content: 'You have already created a ticket!',
                    ephemeral: true
                });
            };





            interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
                parent: client.config.parentOpened,
                topic: interaction.user.id,
                permissionOverwrites: [{
                    id: interaction.user.id,
                    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                    id: client.config.roleSupport,
                    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['VIEW_CHANNEL'],
                },
                ],
                type: 'text',
            }).then(async c => {
                interaction.reply({
                    content: `Ticket has been created! <#${c.id}>`,
                    ephemeral: true
                });

                const embed = new client.discord.MessageEmbed()
                    .setColor('6d6ee8')
                    .setAuthor('Ticket', 'https://www.kindpng.com/picc/m/27-278519_open-a-ticket-icon-blog-clipart-hd-png.png')
                    .setDescription('**To confirm Select the category below**')
                    .setFooter('M', 'https://cdn.discordapp.com/attachments/764582687792431124/996019268728672366/Animated_Logo_Design.gif')
                    .setTimestamp();

                const row = new client.discord.MessageActionRow()
                    .addComponents(
                        new client.discord.MessageSelectMenu()
                            .setCustomId('category')
                            .setPlaceholder('Choose the correct Category')
                            .addOptions([{
                                label: 'General Questions',
                                value: 'General Questions',
                                emoji: '996029746964086874',
                            },
                            {
                                label: 'Partners',
                                value: 'Partners',
                                emoji: '981886303585062962',
                            },
                            {
                                label: 'Claim Giveaways',
                                value: 'Claim Giveaways',
                                emoji: '996029750206275714',
                            },
                            {
                                label: 'Bugs/Reports',
                                value: 'Bugs/Reports',
                                emoji: '996032590316318740',
                            },

                            ]),
                    );

                msg = await c.send({
                    content: `<@!${interaction.user.id}>`,
                    embeds: [embed],
                    components: [row]
                });

                const collector = msg.createMessageComponentCollector({
                    componentType: 'SELECT_MENU',
                    time: 20000
                });

                collector.on('collect', i => {
                    if (i.user.id === interaction.user.id) {
                        if (msg.deletable) {
                            msg.delete().then(async () => {
                                const embed = new client.discord.MessageEmbed()
                                    .setColor('6d6ee8')
                                    .setAuthor('Ticket', 'https://www.kindpng.com/picc/m/27-278519_open-a-ticket-icon-blog-clipart-hd-png.png')
                                    .setDescription(`<@!${interaction.user.id}> Created a ticket\n Client choose: **${i.values[0]}**\n Soon the Support will come to reply to this ticket.`)
                                    .setFooter('M', 'https://cdn.discordapp.com/attachments/764582687792431124/996019268728672366/Animated_Logo_Design.gif')
                                    .setTimestamp();

                                const row = new client.discord.MessageActionRow()
                                    .addComponents(
                                        new client.discord.MessageButton()
                                            .setCustomId('close-ticket')
                                            .setLabel('Close the ticket')
                                            .setEmoji('899745362137477181')
                                            .setStyle('DANGER'),
                                    );

                                const opened = await c.send({
                                    content: `<@&${client.config.roleSupport}>`,
                                    embeds: [embed],
                                    components: [row]
                                });

                                opened.pin().then(() => {
                                    opened.channel.bulkDelete(1);
                                });
                            });
                        };
                        if (i.values[0] == 'General Questions') {
                            c.edit({
                                parent: client.config.parentTransactions
                            });
                        };
                        if (i.values[0] == 'Partners') {
                            c.edit({
                                parent: client.config.parentBugs
                            });
                        };
                        if (i.values[0] == 'Giveaways Prizes') {
                            c.edit({
                                parent: client.config.parentJeux
                            });
                        };
                        if (i.values[0] == 'Bugs/Reports') {
                            c.edit({
                                parent: client.config.parentAutres
                            });
                        };
                    };
                });

                collector.on('end', collected => {
                    if (collected.size < 1) {
                        c.send(`Time has runned out and no category has been select, this ticket will be closed in 5 sec...`).then(() => {
                            setTimeout(() => {
                                if (c.deletable) {
                                    c.delete();
                                };
                            }, 5000);
                        });
                    };
                });
            });
        };

        if (interaction.customId == "close-ticket") {
            const guild = client.guilds.cache.get(interaction.guildId);
            const chan = guild.channels.cache.get(interaction.channelId);

            const row = new client.discord.MessageActionRow()
                .addComponents(
                    new client.discord.MessageButton()
                        .setCustomId('confirm-close')
                        .setLabel('Close the ticket')
                        .setStyle('DANGER'),
                    new client.discord.MessageButton()
                        .setCustomId('no')
                        .setLabel('Cancel closure')
                        .setStyle('SECONDARY'),
                );

            const verif = await interaction.reply({
                content: 'Are you sure that you want to close the ticket?',
                components: [row]
            });

            const collector = interaction.channel.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 10000
            });

            collector.on('collect', i => {
                if (i.customId == 'confirm-close') {
                    interaction.editReply({
                        content: `Ticket closed by: <@!${interaction.user.id}>`,
                        components: []
                    });

                    chan.edit({
                        name: `closed-${chan.name}`,
                        permissionOverwrites: [
                            {
                                id: client.users.cache.get(chan.topic),
                                deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                            },
                            {
                                id: client.config.roleSupport,
                                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                            },
                            {
                                id: interaction.guild.roles.everyone,
                                deny: ['VIEW_CHANNEL'],
                            },
                        ],
                    })
                        .then(async () => {
                            const embed = new client.discord.MessageEmbed()
                                .setColor('6d6ee8')
                                .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/764582687792431124/996019268728672366/Animated_Logo_Design.gif')
                                .setDescription('```Click below to delete the ticket```')
                                .setFooter('Liz Services', 'https://cdn.discordapp.com/attachments/764582687792431124/996019268728672366/Animated_Logo_Design.gif')
                                .setTimestamp();

                            const row = new client.discord.MessageActionRow()
                                .addComponents(
                                    new client.discord.MessageButton()
                                        .setCustomId('delete-ticket')
                                        .setLabel('Delete Ticket')
                                        .setEmoji('🗑️')
                                        .setStyle('DANGER'),
                                );

                            chan.send({
                                embeds: [embed],
                                components: [row]
                            });
                        });

                    collector.stop();
                };
                if (i.customId == 'no') {
                    interaction.editReply({
                        content: 'The closure of the ticket has been canceled !',
                        components: []
                    });
                    collector.stop();
                };
            });

            collector.on('end', (i) => {
                if (i.size < 1) {
                    interaction.editReply({
                        content: 'The closure of the ticket has been canceled!',
                        components: []
                    });
                };
            });
        };

        if (interaction.customId == "delete-ticket") {
            const guild = client.guilds.cache.get(interaction.guildId);
            const chan = guild.channels.cache.get(interaction.channelId);

            interaction.reply({
                content: 'Saving all the messages on the ticket...'
            });

            chan.messages.fetch().then(async (messages) => {
                let a = messages.filter(m => m.author.bot !== true).map(m =>
                    `${new Date(m.createdTimestamp).toLocaleString('pt-PT')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
                ).reverse().join('\n');
                if (a.length < 1) a = "Nothing"
                hastebin.createPaste(a, {
                    contentType: 'text/plain',
                    server: 'https://hastebin.com/'
                }, {})
                    .then(function (urlToPaste) {
                        const embed = new client.discord.MessageEmbed()
                            .setAuthor('Logs Ticket', 'https://i.imgur.com/oO5ZSRK.png')
                            .setDescription(`📰 Ticket Logs \`${chan.id}\` created by: <@!${chan.topic}> deleted by: <@!${interaction.user.id}>\n\nLogs: [**Click here to see Logs**](${urlToPaste})`)
                            .setColor('2f3136')
                            .setTimestamp();

                        const embed2 = new client.discord.MessageEmbed()
                            .setAuthor('Logs Ticket', 'https://i.imgur.com/oO5ZSRK.png')
                            .setDescription(`📰 Logs of your ticket \`${chan.id}\`: [**Click here to see logs**](${urlToPaste})`)
                            .setColor('2f3136')
                            .setTimestamp();

                        client.channels.cache.get(client.config.logsTicket).send({
                            embeds: [embed]
                        });
                        client.users.cache.get(chan.topic).send({
                            embeds: [embed2]
                        }).catch(() => { console.log('I can\'t dm him :(') });
                        chan.send('Deleting the channel in 5 sec...');

                        setTimeout(() => {
                            chan.delete();
                        }, 5000);
                    });
            });
        };
    },
};


