const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption((opt) => opt.setName('question').setDescription('Poll question').setRequired(true))
        .addStringOption((opt) => opt.setName('option1').setDescription('Option 1').setRequired(false))
        .addStringOption((opt) => opt.setName('option2').setDescription('Option 2').setRequired(false))
        .addStringOption((opt) => opt.setName('option3').setDescription('Option 3').setRequired(false))
        .addStringOption((opt) => opt.setName('option4').setDescription('Option 4').setRequired(false))
        .addStringOption((opt) => opt.setName('option5').setDescription('Option 5').setRequired(false)),
    category: 'fun',
    cooldown: 10,

    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const options = [];

        for (let i = 1; i <= 5; i++) {
            const opt = interaction.options.getString(`option${i}`);
            if (opt) options.push(opt);
        }

        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

        const embed = new EmbedBuilder()
            .setTitle('📊 Poll')
            .setColor(config.colors.info)
            .setFooter({ text: `Poll by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (options.length === 0) {
            embed.setDescription(`**${question}**\n\nReact with 👍 or 👎`);
            const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
            await msg.react('👍');
            await msg.react('👎');
        } else {
            const desc = options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n\n');
            embed.setDescription(`**${question}**\n\n${desc}`);
            const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
            for (let i = 0; i < options.length; i++) {
                await msg.react(numberEmojis[i]);
            }
        }
    },
};