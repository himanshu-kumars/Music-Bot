const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and API response time'),
    category: 'info',
    cooldown: 3,

    async execute(interaction, client) {
        const sent = await interaction.deferReply({ fetchReply: true });

        // Database ping
        const dbStart = Date.now();
        await mongoose.connection.db.admin().ping();
        const dbPing = Date.now() - dbStart;

        const apiPing = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = client.ws.ping;

        const getStatus = (ms) => {
            if (ms < 100) return '🟢 Excellent';
            if (ms < 200) return '🟡 Good';
            if (ms < 400) return '🟠 Moderate';
            return '🔴 Poor';
        };

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription('Here are the current latency statistics:')
            .addFields(
                {
                    name: '📡 Bot Latency',
                    value: `\`\`\`\n${apiPing}ms ${getStatus(apiPing)}\n\`\`\``,
                    inline: true,
                },
                {
                    name: '💓 WebSocket',
                    value: `\`\`\`\n${wsPing}ms ${getStatus(wsPing)}\n\`\`\``,
                    inline: true,
                },
                {
                    name: '🗄️ Database',
                    value: `\`\`\`\n${dbPing}ms ${getStatus(dbPing)}\n\`\`\``,
                    inline: true,
                },
                {
                    name: '⏱️ Uptime',
                    value: `\`\`\`\n${formatUptime(client.uptime)}\n\`\`\``,
                    inline: false,
                }
            )
            .setColor(wsPing < 200 ? config.colors.success : config.colors.warning)
            .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}