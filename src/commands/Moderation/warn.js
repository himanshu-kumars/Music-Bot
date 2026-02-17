const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');
const Warning = require('../../models/Warning');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption((opt) => opt.setName('user').setDescription('User to warn').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for warning').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.ManageMessages],

    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.bot) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot warn bots!`)], ephemeral: true });
        if (user.id === interaction.user.id) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot warn yourself!`)], ephemeral: true });

        const warnId = crypto.randomBytes(4).toString('hex');

        const warning = new Warning({
            guildId: interaction.guild.id,
            userId: user.id,
            moderatorId: interaction.user.id,
            reason: reason,
            warnId: warnId,
        });

        await warning.save();

        const totalWarnings = await Warning.countDocuments({
            guildId: interaction.guild.id,
            userId: user.id,
        });

        // DM user
        await user.send({
            embeds: [new EmbedBuilder()
                .setTitle(`${config.emojis.warning} You have been warned`)
                .setDescription(`You have been warned in **${interaction.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Total Warnings', value: `${totalWarnings}`, inline: true }
                )
                .setColor(config.colors.warning).setTimestamp()]
        }).catch(() => {});

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.warning} Member Warned`)
            .addFields(
                { name: '👤 User', value: `${user} (\`${user.id}\`)`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user}`, inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '🔢 Total Warnings', value: `\`${totalWarnings}\``, inline: true },
                { name: '🆔 Warn ID', value: `\`${warnId}\``, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(config.colors.warning)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};