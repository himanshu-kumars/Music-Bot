const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');
const progressBar = require('../../utils/progressBar');

module.exports = {
    data: new SlashCommandBuilder().setName('nowplaying').setDescription('Show the currently playing song'),
    category: 'music',
    cooldown: 3,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        const track = queue.currentTrack;
        const progress = queue.node.getTimestamp();
        const bar = progressBar.music(progress?.current?.value || 0, progress?.total?.value || track.durationMS, 20);

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.music} Now Playing`)
            .setDescription(`[${track.title}](${track.url})`)
            .addFields(
                { name: '👤 Artist', value: `\`${track.author}\``, inline: true },
                { name: '🎧 Requested by', value: `${track.requestedBy}`, inline: true },
                { name: '🔊 Volume', value: `\`${queue.node.volume}%\``, inline: true },
                { name: '⏱️ Progress', value: `${progress?.current?.label || '0:00'} ${bar} ${progress?.total?.label || track.duration}`, inline: false }
            )
            .setThumbnail(track.thumbnail)
            .setColor(config.colors.music)
            .setFooter({ text: `Queue: ${queue.tracks.size} track(s)` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};