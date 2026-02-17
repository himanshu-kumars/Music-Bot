const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout (mute) a member')
        .addUserOption((opt) => opt.setName('user').setDescription('User to timeout').setRequired(true))
        .addStringOption((opt) => opt.setName('duration').setDescription('Duration (e.g., 1h, 30m, 1d)').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.ModerateMembers],
    botPermissions: [PermissionFlagsBits.ModerateMembers],

    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} User not found in this server!`)], ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot timeout yourself!`)], ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} I cannot timeout this user!`)], ephemeral: true });
        }

        const durationMs = ms(duration);
        if (!durationMs || durationMs < 5000 || durationMs > 2419200000) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Invalid duration! Min: 5s, Max: 28 days`)], ephemeral: true });
        }

        await member.timeout(durationMs, `${reason} | By ${interaction.user.tag}`);

        // DM user
        await user.send({
            embeds: [new EmbedBuilder()
                .setTitle(`${config.emojis.moderation} You have been timed out`)
                .setDescription(`You have been timed out in **${interaction.guild.name}**`)
                .addFields(
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setColor(config.colors.warning).setTimestamp()]
        }).catch(() => {});

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Member Timed Out`)
            .addFields(
                { name: '👤 User', value: `${user} (\`${user.id}\`)`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user}`, inline: true },
                { name: '⏱️ Duration', value: `\`${duration}\``, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(config.colors.moderation)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};