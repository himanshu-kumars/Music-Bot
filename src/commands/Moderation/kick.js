const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption((opt) => opt.setName('user').setDescription('User to kick').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for kick').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers],

    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} User not found in this server!`)],
                ephemeral: true,
            });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot kick yourself!`)],
                ephemeral: true,
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} I cannot kick this user!`)],
                ephemeral: true,
            });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot kick someone with equal or higher role!`)],
                ephemeral: true,
            });
        }

        // DM user
        await user.send({
            embeds: [new EmbedBuilder()
                .setTitle(`${config.emojis.moderation} You have been kicked`)
                .setDescription(`You have been kicked from **${interaction.guild.name}**`)
                .addFields({ name: 'Reason', value: reason }, { name: 'Moderator', value: interaction.user.tag })
                .setColor(config.colors.warning).setTimestamp()]
        }).catch(() => {});

        await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Member Kicked`)
            .setDescription(`**${user.tag}** has been kicked from the server.`)
            .addFields(
                { name: '👤 User', value: `${user} (\`${user.id}\`)`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user}`, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(config.colors.moderation)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};