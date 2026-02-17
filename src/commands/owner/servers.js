const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const { isOwner } = require('../../utils/permissions');
const { pagination } = require('../../utils/pagination');

module.exports = {
    data: new SlashCommandBuilder().setName('servers').setDescription('List all servers the bot is in (Owner Only)'),
    category: 'owner',
    cooldown: 5,
    ownerOnly: true,

    async execute(interaction, client) {
        if (!isOwner(interaction.user.id)) return interaction.reply({ content: 'Owner only!', ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).map((g) => g);
        const pages = [];
        const itemsPerPage = 10;

        for (let i = 0; i < guilds.length; i += itemsPerPage) {
            const current = guilds.slice(i, i + itemsPerPage);
            const embed = new EmbedBuilder()
                .setTitle(`📋 Bot Servers (${client.guilds.cache.size})`)
                .setDescription(
                    current.map((g, idx) =>
                        `**${i + idx + 1}.** ${g.name} — \`${g.id}\`\n> 👥 ${g.memberCount} members`
                    ).join('\n\n')
                )
                .setColor(config.colors.info)
                .setTimestamp();
            pages.push(embed);
        }

        await pagination(interaction, pages);
    },
};