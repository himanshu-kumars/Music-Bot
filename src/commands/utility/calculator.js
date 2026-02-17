const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const math = require('mathjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('Calculate a math expression')
        .addStringOption((opt) => opt.setName('expression').setDescription('Math expression (e.g., 2+2, sqrt(16))').setRequired(true)),
    category: 'utility',
    cooldown: 3,

    async execute(interaction, client) {
        const expression = interaction.options.getString('expression');

        try {
            const result = math.evaluate(expression);
            const embed = new EmbedBuilder()
                .setTitle('🧮 Calculator')
                .addFields(
                    { name: '📥 Input', value: `\`\`\`${expression}\`\`\``, inline: false },
                    { name: '📤 Output', value: `\`\`\`${result}\`\`\``, inline: false }
                )
                .setColor(config.colors.info)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Invalid expression! Error: \`${error.message}\``)],
                ephemeral: true,
            });
        }
    },
};