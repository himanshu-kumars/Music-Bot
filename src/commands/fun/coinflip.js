const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin')
        .addStringOption((opt) => opt.setName('choice').setDescription('Your guess').addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' }).setRequired(false)),
    category: 'fun',
    cooldown: 2,

    async execute(interaction) {
        const choice = interaction.options.getString('choice');
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const emoji = result === 'heads' ? '🪙' : '💫';

        let description = `The coin landed on **${result}**! ${emoji}`;
        let color = config.colors.primary;

        if (choice) {
            if (choice === result) {
                description += `\n\n${config.emojis.success} You guessed correctly!`;
                color = config.colors.success;
            } else {
                description += `\n\n${config.emojis.error} You guessed wrong!`;
                color = config.colors.error;
            }
        }

        await interaction.reply({
            embeds: [new EmbedBuilder().setTitle('🪙 Coin Flip').setDescription(description).setColor(color).setTimestamp()],
        });
    },
};