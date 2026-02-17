const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../../../config');
const Level = require('../../models/Level');
const constants = require('../../utils/constants');
const progressBar = require('../../utils/progressBar');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your or someone\'s rank')
        .addUserOption((opt) => opt.setName('user').setDescription('User to check').setRequired(false)),
    category: 'leveling',
    cooldown: 5,

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;

        let data = await Level.findOne({ userId: user.id, guildId: interaction.guild.id });
        if (!data) {
            data = { xp: 0, level: 0, totalXp: 0, messageCount: 0 };
        }

        const requiredXp = constants.xpForLevel(data.level);
        const bar = progressBar.xp(data.xp, requiredXp);

        // Get rank position
        const allUsers = await Level.find({ guildId: interaction.guild.id }).sort({ totalXp: -1 });
        const rank = allUsers.findIndex((u) => u.userId === user.id) + 1 || allUsers.length + 1;

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.leveling} ${user.username}'s Rank`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🏅 Rank', value: `\`#${rank}\``, inline: true },
                { name: '📊 Level', value: `\`${data.level}\``, inline: true },
                { name: '✨ Total XP', value: `\`${data.totalXp?.toLocaleString() || 0}\``, inline: true },
                { name: '📈 Progress', value: `${bar}\n\`${data.xp} / ${requiredXp} XP\``, inline: false },
                { name: '💬 Messages', value: `\`${data.messageCount?.toLocaleString() || 0}\``, inline: true },
            )
            .setColor(config.colors.level)
            .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};