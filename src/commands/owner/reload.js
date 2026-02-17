const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const { isOwner } = require('../../utils/permissions');
const { reloadCommand } = require('../../handlers/commandHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload a command (Owner Only)')
        .addStringOption((opt) => opt.setName('command').setDescription('Command name to reload').setRequired(true).setAutocomplete(true)),
    category: 'owner',
    cooldown: 0,
    ownerOnly: true,

    async autocomplete(interaction, client) {
        const focused = interaction.options.getFocused().toLowerCase();
        const choices = client.commands.map((cmd) => ({ name: cmd.data.name, value: cmd.data.name }));
        const filtered = choices.filter((c) => c.name.includes(focused)).slice(0, 25);
        await interaction.respond(filtered);
    },

    async execute(interaction, client) {
        if (!isOwner(interaction.user.id)) return interaction.reply({ content: 'Owner only!', ephemeral: true });

        const commandName = interaction.options.getString('command');
        const result = await reloadCommand(client, commandName);

        const embed = new EmbedBuilder()
            .setDescription(result.success ? `${config.emojis.success} ${result.message}` : `${config.emojis.error} ${result.message}`)
            .setColor(result.success ? config.colors.success : config.colors.error)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};