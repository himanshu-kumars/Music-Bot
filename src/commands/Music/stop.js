const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder().setName('stop').setDescription('Stop the music and clear the queue'),
    category: 'music',
    cooldown: 2,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        queue.delete();

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.stop} Music stopped and queue cleared!`).setTimestamp()],
        });
    },
};