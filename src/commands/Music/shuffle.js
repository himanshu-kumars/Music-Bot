const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue'),
    category: 'music',
    cooldown: 3,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        if (queue.tracks.size < 2) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Not enough tracks to shuffle!`)], ephemeral: true });
        }

        queue.tracks.shuffle();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.shuffle} Queue shuffled! (${queue.tracks.size} tracks)`).setTimestamp()],
        });
    },
};