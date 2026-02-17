const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode')
        .addStringOption((opt) =>
            opt.setName('mode').setDescription('Loop mode').setRequired(true)
                .addChoices(
                    { name: '❌ Off', value: 'off' },
                    { name: '🔂 Track', value: 'track' },
                    { name: '🔁 Queue', value: 'queue' },
                    { name: '♾️ Autoplay', value: 'autoplay' }
                )
        ),
    category: 'music',
    cooldown: 2,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        const mode = interaction.options.getString('mode');
        const modes = {
            off: QueueRepeatMode.OFF,
            track: QueueRepeatMode.TRACK,
            queue: QueueRepeatMode.QUEUE,
            autoplay: QueueRepeatMode.AUTOPLAY,
        };

        const modeNames = { off: '❌ Off', track: '🔂 Track Loop', queue: '🔁 Queue Loop', autoplay: '♾️ Autoplay' };

        queue.setRepeatMode(modes[mode]);

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.loop} Loop mode set to **${modeNames[mode]}**`).setTimestamp()],
        });
    },
};