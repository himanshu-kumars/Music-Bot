const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for a channel')
        .addIntegerOption((opt) => opt.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setMinValue(0).setMaxValue(21600).setRequired(true))
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],

    async execute(interaction, client) {
        const seconds = interaction.options.getInteger('seconds');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        await channel.setRateLimitPerUser(seconds);

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Slowmode Updated`)
            .setDescription(
                seconds === 0
                    ? `Slowmode has been **disabled** in ${channel}`
                    : `Slowmode set to **${seconds} seconds** in ${channel}`
            )
            .setColor(config.colors.success)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};