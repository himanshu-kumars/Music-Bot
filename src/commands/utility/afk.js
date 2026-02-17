const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const AFK = require('../../models/AFK');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption((opt) => opt.setName('message').setDescription('AFK message').setRequired(false)),
    category: 'utility',
    cooldown: 5,

    async execute(interaction, client) {
        const message = interaction.options.getString('message') || 'AFK';

        await AFK.findOneAndUpdate(
            { userId: interaction.user.id, guildId: interaction.guild.id },
            { userId: interaction.user.id, guildId: interaction.guild.id, message, timestamp: new Date() },
            { upsert: true, new: true }
        );

        // Set nickname
        interaction.member.setNickname(`[AFK] ${interaction.member.displayName}`.slice(0, 32)).catch(() => {});

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`${config.emojis.success} ${interaction.user}, your AFK has been set: **${message}**`)
                .setColor(config.colors.success).setTimestamp()],
        });
    },
};