const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');
const Ticket = require('../../models/Ticket');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-close')
        .setDescription('Close the current ticket'),
    category: 'tickets',
    cooldown: 5,

    async execute(interaction, client) {
        await this.handleButton(interaction, client);
    },

    async handleButton(interaction, client) {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: 'open' });
        if (!ticket) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} This is not a ticket channel!`)],
                ephemeral: true,
            });
        }

        const confirmButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_confirm_close').setLabel('Confirm Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('ticket_cancel_close').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setEmoji('❌')
        );

        const confirmMsg = await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.warning).setDescription(`${config.emojis.warning} Are you sure you want to close this ticket?`)],
            components: [confirmButtons],
            fetchReply: true,
        });

        const collector = confirmMsg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'ticket_cancel_close') {
                await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.info).setDescription('Ticket close cancelled.')], components: [] });
                return;
            }

            if (i.customId === 'ticket_confirm_close') {
                ticket.status = 'closed';
                ticket.closedBy = i.user.id;
                ticket.closedAt = new Date();
                await ticket.save();

                await i.update({
                    embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`🔒 Ticket closed by ${i.user}. This channel will be deleted in 5 seconds.`)],
                    components: [],
                });

                // Log to ticket log channel
                const guildData = await Guild.findOne({ guildId: interaction.guild.id });
                if (guildData?.tickets?.logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(guildData.tickets.logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('🎫 Ticket Closed')
                            .addFields(
                                { name: 'Ticket', value: `#${ticket.ticketNumber}`, inline: true },
                                { name: 'Opened by', value: `<@${ticket.userId}>`, inline: true },
                                { name: 'Closed by', value: `${i.user}`, inline: true }
                            )
                            .setColor(config.colors.error)
                            .setTimestamp();
                        logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                    }
                }

                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        });
    },
};