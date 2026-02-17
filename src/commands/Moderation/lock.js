const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to lock').setRequired(false))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for locking').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: false,
        });

        const embed = new EmbedBuilder()
            .setTitle('🔒 Channel Locked')
            .setDescription(`${channel} has been locked.\n\n**Reason:** ${reason}`)
            .addFields({ name: '👮 Moderator', value: `${interaction.user}`, inline: true })
            .setColor(config.colors.error)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        if (channel.id !== interaction.channel.id) {
            await channel.send({
                embeds: [new EmbedBuilder()
                    .setDescription(`🔒 This channel has been locked by ${interaction.user}.\n**Reason:** ${reason}`)
                    .setColor(config.colors.error)]
            }).catch(() => {});
        }
    },
};