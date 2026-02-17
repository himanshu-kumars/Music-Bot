const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const { isOwner } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder().setName('shutdown').setDescription('Shutdown the bot (Owner Only)'),
    category: 'owner',
    cooldown: 0,
    ownerOnly: true,

    async execute(interaction, client) {
        if (!isOwner(interaction.user.id)) return interaction.reply({ content: 'Owner only!', ephemeral: true });

        await interaction.reply({
            embeds: [new EmbedBuilder().setDescription('🔴 Shutting down...').setColor(config.colors.error).setTimestamp()],
        });

        setTimeout(() => {
            client.destroy();
            process.exit(0);
        }, 2000);
    },
};