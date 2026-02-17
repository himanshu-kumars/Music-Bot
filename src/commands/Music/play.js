const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist')
        .addStringOption((opt) =>
            opt.setName('query').setDescription('Song name or URL (YouTube, Spotify, SoundCloud)').setRequired(true).setAutocomplete(true)
        ),
    category: 'music',
    cooldown: 2,

    async autocomplete(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getFocused();
        if (!query) return interaction.respond([]);

        const results = await player.search(query);
        const choices = results.tracks.slice(0, 10).map((t) => ({
            name: `${t.title} — ${t.author}`.slice(0, 100),
            value: t.url,
        }));
        await interaction.respond(choices).catch(() => {});
    },

    async execute(interaction, client) {
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You must be in a voice channel!`)],
                ephemeral: true,
            });
        }

        if (interaction.guild.members.me.voice.channelId && interaction.guild.members.me.voice.channelId !== channel.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} I'm already in a different voice channel!`)],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        const player = useMainPlayer();
        const query = interaction.options.getString('query');

        try {
            const result = await player.search(query, { requestedBy: interaction.user });

            if (!result || !result.tracks.length) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No results found for \`${query}\``)],
                });
            }

            const { track } = await player.play(channel, result, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user,
                    },
                    volume: 50,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEnd: false,
                    leaveOnEndCooldown: 300000,
                    selfDeaf: true,
                },
            });

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis.music} Added to Queue`)
                .setDescription(`[${track.title}](${track.url})`)
                .addFields(
                    { name: '👤 Artist', value: `\`${track.author}\``, inline: true },
                    { name: '⏱️ Duration', value: `\`${track.duration}\``, inline: true },
                    { name: '🎧 Requested by', value: `${interaction.user}`, inline: true }
                )
                .setThumbnail(track.thumbnail)
                .setColor(config.colors.music)
                .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            if (result.playlist) {
                embed.setTitle(`${config.emojis.music} Playlist Added to Queue`);
                embed.addFields({ name: '📜 Playlist', value: `\`${result.playlist.title}\` — ${result.tracks.length} tracks`, inline: false });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Error: ${error.message}`)],
            });
        }
    },
};