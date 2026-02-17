const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption((opt) => opt.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for ban').setRequired(false))
        .addIntegerOption((opt) => opt.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const days = interaction.options.getInteger('days') || 0;
        const member = interaction.guild.members.cache.get(user.id);

        if (user.id === interaction.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot ban yourself!`)],
                ephemeral: true,
            });
        }

        if (user.id === client.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} I cannot ban myself!`)],
                ephemeral: true,
            });
        }

        if (member) {
            if (!member.bannable) {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} I cannot ban this user! They may have higher permissions.`)],
                    ephemeral: true,
                });
            }

            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot ban someone with equal or higher role!`)],
                    ephemeral: true,
                });
            }
        }

        // DM user before ban
        const dmEmbed = new EmbedBuilder()
            .setTitle(`${config.emojis.moderation} You have been banned`)
            .setDescription(`You have been banned from **${interaction.guild.name}**`)
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true }
            )
            .setColor(config.colors.error)
            .setTimestamp();

        await user.send({ embeds: [dmEmbed] }).catch(() => {});

        // Ban
        await interaction.guild.members.ban(user, {
            deleteMessageDays: days,
            reason: `${reason} | Banned by ${interaction.user.tag}`,
        });

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Member Banned`)
            .setDescription(`**${user.tag}** has been banned from the server.`)
            .addFields(
                { name: '👤 User', value: `${user} (\`${user.id}\`)`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user}`, inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '🗑️ Messages Deleted', value: `${days} day(s)`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(config.colors.moderation)
            .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Log to mod log
        const Guild = require('../../models/Guild');
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (guildData?.logging?.modLog) {
            const logChannel = interaction.guild.channels.cache.get(guildData.logging.modLog);
            if (logChannel) logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    },
};