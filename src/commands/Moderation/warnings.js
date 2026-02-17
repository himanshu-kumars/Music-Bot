const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');
const Warning = require('../../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption((opt) => opt.setName('user').setDescription('User to check warnings for').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    category: 'moderation',
    cooldown: 3,

    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const warnings = await Warning.find({ guildId: interaction.guild.id, userId: user.id }).sort({ createdAt: -1 });

        if (warnings.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} **${user.tag}** has no warnings.`)],
            });
        }

        const warningList = warnings.map((w, i) =>
            `**${i + 1}.** \`${w.warnId}\` — ${w.reason}\n> By <@${w.moderatorId}> • <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.warning} Warnings for ${user.tag}`)
            .setDescription(warningList.slice(0, 4000))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(config.colors.warning)
            .setFooter({ text: `Total: ${warnings.length} warning(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};