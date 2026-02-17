const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const { isOwner } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate JavaScript code (Owner Only)')
        .addStringOption((opt) => opt.setName('code').setDescription('Code to evaluate').setRequired(true)),
    category: 'owner',
    cooldown: 0,
    ownerOnly: true,

    async execute(interaction, client) {
        if (!isOwner(interaction.user.id)) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Owner only command!`)], ephemeral: true });
        }

        const code = interaction.options.getString('code');

        try {
            let result = eval(code);
            if (result instanceof Promise) result = await result;

            let output = typeof result === 'string' ? result : require('util').inspect(result, { depth: 2 });
            if (output.length > 4000) output = output.slice(0, 4000) + '...';

            // Clean sensitive data
            output = output.replace(new RegExp(config.token, 'g'), '[REDACTED]');

            const embed = new EmbedBuilder()
                .setTitle('📥 Eval Result')
                .addFields(
                    { name: '📝 Input', value: `\`\`\`js\n${code.slice(0, 1000)}\n\`\`\`` },
                    { name: '📤 Output', value: `\`\`\`js\n${output}\n\`\`\`` }
                )
                .setColor(config.colors.success)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Eval Error')
                .addFields(
                    { name: '📝 Input', value: `\`\`\`js\n${code.slice(0, 1000)}\n\`\`\`` },
                    { name: '❌ Error', value: `\`\`\`js\n${error.message?.slice(0, 1000)}\n\`\`\`` }
                )
                .setColor(config.colors.error)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};