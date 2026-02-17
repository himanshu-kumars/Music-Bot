const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the music volume')
        .addIntegerOption((opt) => opt.setName('amount').setDescription('Volume (1-200)').setMinValue(1).setMaxValue(200).setRequired(true)),
    category: 'music',
    cooldown: 2,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music is playing!`)], ephemeral: true });
        }

        const vol = interaction.options.getInteger('amount');
        queue.node.setVolume(vol);

        const volumeBar = '█'.repeat(Math.round(vol / 10)) + '░'.repeat(Math.max(0, 20 - Math.round(vol / 10)));

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(config.colors.music)
                .setDescription(`${config.emojis.volume} Volume set to **${vol}%**\n\`${volumeBar}\``)
                .setTimestamp()],
        });
    },
};