const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption((opt) => opt.setName('question').setDescription('Your question').setRequired(true)),
    category: 'fun',
    cooldown: 3,

    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const answers = [
            '🟢 Yes, definitely!', '🟢 Without a doubt!', '🟢 Absolutely!', '🟢 Of course!',
            '🟡 Most likely.', '🟡 Probably.', '🟡 Signs point to yes.',
            '🟠 Ask again later.', '🟠 Cannot predict now.', '🟠 Concentrate and ask again.',
            '🔴 Don\'t count on it.', '🔴 Very doubtful.', '🔴 No way!', '🔴 Absolutely not.',
        ];

        const answer = answers[Math.floor(Math.random() * answers.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: '❓ Question', value: question },
                { name: '🎱 Answer', value: answer }
            )
            .setColor(config.colors.primary)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};