const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to unlock').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        await channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: null,
        });

        const embed = new EmbedBuilder()
            .setTitle('🔓 Channel Unlocked')
            .setDescription(`${channel} has been unlocked.`)
            .addFields({ name: '👮 Moderator', value: `${interaction.user}`, inline: true })
            .setColor(config.colors.success)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};