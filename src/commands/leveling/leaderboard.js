const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Level = require('../../models/Level');
const { pagination } = require('../../utils/pagination');

module.exports = {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('View the XP leaderboard'),
    category: 'leveling',
    cooldown: 5,

    async execute(interaction, client) {
        await interaction.deferReply();

        const allUsers = await Level.find({ guildId: interaction.guild.id }).sort({ totalXp: -1 }).limit(100);

        if (allUsers.length === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No one has earned XP yet!`)],
            });
        }

        const medals = ['🥇', '🥈', '🥉'];
        const pages = [];
        const itemsPerPage = 10;

        for (let i = 0; i < allUsers.length; i += itemsPerPage) {
            const current = allUsers.slice(i, i + itemsPerPage);
            const desc = current.map((u, idx) => {
                const pos = i + idx;
                const prefix = pos < 3 ? medals[pos] : `**${pos + 1}.**`;
                return `${prefix} <@${u.userId}> — Level \`${u.level}\` • \`${u.totalXp.toLocaleString()}\` XP`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis.trophy} XP Leaderboard`)
                .setDescription(desc)
                .setColor(config.colors.level)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp();
            pages.push(embed);
        }

        await pagination(interaction, pages);
    },
};