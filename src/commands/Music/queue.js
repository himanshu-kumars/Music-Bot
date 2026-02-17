const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');
const { pagination } = require('../../utils/pagination');

module.exports = {
    data: new SlashCommandBuilder().setName('queue').setDescription('View the current music queue'),
    category: 'music',
    cooldown: 3,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        await interaction.deferReply();

        const tracks = queue.tracks.toArray();
        const currentTrack = queue.currentTrack;

        if (tracks.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis.queue} Music Queue`)
                .setDescription(`**Now Playing:**\n[${currentTrack.title}](${currentTrack.url}) — \`${currentTrack.duration}\`\n\n*No more tracks in queue*`)
                .setThumbnail(currentTrack.thumbnail)
                .setColor(config.colors.music)
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        const itemsPerPage = 10;
        const pages = [];

        for (let i = 0; i < tracks.length; i += itemsPerPage) {
            const current = tracks.slice(i, i + itemsPerPage);
            const description = current
                .map((track, index) => `**${i + index + 1}.** [${track.title}](${track.url}) — \`${track.duration}\` | ${track.requestedBy}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis.queue} Music Queue — ${tracks.length} tracks`)
                .setDescription(
                    `**Now Playing:**\n${config.emojis.play} [${currentTrack.title}](${currentTrack.url}) — \`${currentTrack.duration}\`\n\n**Up Next:**\n${description}`
                )
                .setThumbnail(currentTrack.thumbnail)
                .setColor(config.colors.music)
                .setTimestamp();

            pages.push(embed);
        }

        await pagination(interaction, pages);
    },
};