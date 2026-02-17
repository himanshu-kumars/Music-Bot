const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View detailed bot statistics'),
    category: 'info',
    cooldown: 5,

    async execute(interaction, client) {
        await interaction.deferReply();

        const mem = process.memoryUsage();
        const cpus = os.cpus();
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        const totalChannels = client.channels.cache.size;

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${config.bot.name} — Statistics`)
            .addFields(
                {
                    name: '📈 Bot Stats',
                    value: `\`\`\`\nServers  : ${totalGuilds}\nUsers    : ${totalUsers.toLocaleString()}\nChannels : ${totalChannels}\nCommands : ${client.commands.size}\nPing     : ${client.ws.ping}ms\n\`\`\``,
                    inline: true,
                },
                {
                    name: '💻 System Stats',
                    value: `\`\`\`\nOS       : ${os.type()} ${os.arch()}\nNode.js  : ${process.version}\nMemory   : ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\nCPU      : ${cpus[0]?.model?.trim() || 'Unknown'}\nCores    : ${cpus.length}\n\`\`\``,
                    inline: true,
                },
                {
                    name: '⏱️ Uptime',
                    value: `Started <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
                    inline: false,
                }
            )
            .setColor(config.colors.info)
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `${config.bot.name} v${config.bot.version}`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};