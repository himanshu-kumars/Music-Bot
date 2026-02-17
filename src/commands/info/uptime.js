const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('View bot uptime'),
    category: 'info',
    cooldown: 3,

    async execute(interaction, client) {
        const uptime = client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor((uptime % 86400000) / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);

        const embed = new EmbedBuilder()
            .setTitle('⏱️ Bot Uptime')
            .setDescription(
                `\`\`\`\n${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds\n\`\`\`\n` +
                `**Started:** <t:${Math.floor((Date.now() - uptime) / 1000)}:F>\n` +
                `**Since:** <t:${Math.floor((Date.now() - uptime) / 1000)}:R>`
            )
            .setColor(config.colors.success)
            .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};