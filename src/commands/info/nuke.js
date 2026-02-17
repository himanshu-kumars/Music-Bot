const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Clone and delete the current channel (deletes all messages)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    category: 'moderation',
    cooldown: 30,
    userPermissions: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],

    async execute(interaction, client) {
        const channel = interaction.channel;
        const position = channel.position;

        const newChannel = await channel.clone({ position });
        await channel.delete();

        const embed = new EmbedBuilder()
            .setTitle('💥 Channel Nuked')
            .setDescription(`This channel has been nuked by ${interaction.user}`)
            .setImage('https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif')
            .setColor(config.colors.error)
            .setTimestamp();

        await newChannel.send({ embeds: [embed] });
    },
};