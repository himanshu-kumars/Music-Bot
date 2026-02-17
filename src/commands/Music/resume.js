const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder().setName('resume').setDescription('Resume the paused song'),
    category: 'music',
    cooldown: 2,

    async execute(interaction, client) {
        const queue = useQueue(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No music queue found!`)], ephemeral: true });
        }

        queue.node.resume();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.music).setDescription(`${config.emojis.play} Music resumed!`).setTimestamp()],
        });
    },
};