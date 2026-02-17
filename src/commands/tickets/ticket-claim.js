const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder().setName('ticket-claim').setDescription('Claim this ticket'),
    category: 'tickets',
    cooldown: 3,

    async execute(interaction, client) {
        await this.handleButton(interaction, client);
    },

    async handleButton(interaction, client) {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
        if (!ticket) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} This is not a ticket!`)], ephemeral: true });
        if (ticket.claimedBy) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} This ticket is already claimed by <@${ticket.claimedBy}>!`)], ephemeral: true });

        ticket.claimedBy = interaction.user.id;
        ticket.status = 'claimed';
        await ticket.save();

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} ${interaction.user} has claimed this ticket!`).setTimestamp()],
        });
    },
};