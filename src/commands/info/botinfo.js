const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const config = require('../../../config');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('View detailed information about the bot'),
    category: 'info',
    cooldown: 5,

    async execute(interaction, client) {
        await interaction.deferReply();

        const totalMembers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalGuilds = client.guilds.cache.size;
        const memUsage = process.memoryUsage();

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.sparkle} ${config.bot.name} — Bot Information`)
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                {
                    name: '🤖 General',
                    value: [
                        `> **Name:** ${client.user.tag}`,
                        `> **ID:** \`${client.user.id}\``,
                        `> **Version:** \`v${config.bot.version}\``,
                        `> **Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`,
                        `> **Uptime:** \`${formatUptime(client.uptime)}\``,
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '📊 Statistics',
                    value: [
                        `> **Servers:** \`${totalGuilds}\``,
                        `> **Users:** \`${totalMembers.toLocaleString()}\``,
                        `> **Channels:** \`${totalChannels}\``,
                        `> **Commands:** \`${client.commands.size}\``,
                        `> **Ping:** \`${client.ws.ping}ms\``,
                    ].join('\n'),
                    inline: true,
                },
                {
                    name: '⚙️ System',
                    value: [
                        `> **OS:** \`${os.type()} ${os.release()}\``,
                        `> **Node.js:** \`${process.version}\``,
                        `> **Discord.js:** \`v${djsVersion}\``,
                        `> **Memory:** \`${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\``,
                        `> **CPU:** \`${os.cpus()[0]?.model || 'Unknown'}\``,
                    ].join('\n'),
                    inline: true,
                },
                {
                    name: '🔗 Links',
                    value: [
                        `> [📩 Invite Bot](${config.bot.invite})`,
                        `> [💬 Support Server](${config.bot.support})`,
                        `> [🌐 Website](${config.bot.website})`,
                    ].join('\n'),
                    inline: false,
                }
            )
            .setColor(config.colors.info)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

function formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${days}d ${hours}h ${minutes}m`;
}