const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Apply audio filters')
        .addStringOption((opt) =>
            opt.setName('name').setDescription('Filter to apply').setRequired(true)
                .addChoices(
                    { name: '🔊 Bass Boost', value: 'bassboost' },
                    { name: '🌙 Nightcore', value: 'nightcore' },
                    { name: '🌊 Vaporwave', value: 'vaporwave' },
                    { name: '🎭 8D Audio', value: '8D' },
                    { name: '🔄 Reverse', value: 'reverse' },
                    { name: '🎤 Karaoke', value: 'karaoke' },
                    { name: '📻 Lo-Fi', value: 'lofi' },
                    { name: '🎵 Tremolo', value: 'tremolo' },
                    { name: '🌀 Vibrato', value: 'vibrato' },
                    { name: '❌ Clear All', value: 'clear' }
                )
        ),
    category: 'music',
    cooldown: 5,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        const filter = interaction.options.getString('name');

        await interaction.deferReply();

        if (filter === 'clear') {
            queue.filters.ffmpeg.setFilters(false);
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.success} All filters cleared!`).setTimestamp()],
            });
        }

        const isEnabled = queue.filters.ffmpeg.filters.includes(filter);

        if (isEnabled) {
            queue.filters.ffmpeg.toggle([filter]);
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.error} Filter \`${filter}\` disabled!`).setTimestamp()],
            });
        }

        queue.filters.ffmpeg.toggle([filter]);

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.success} Filter \`${filter}\` enabled!`).setTimestamp()],
        });
    },
};