const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete messages from a channel')
        .addIntegerOption((opt) => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
        .addUserOption((opt) => opt.setName('user').setDescription('Only delete messages from this user').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    category: 'moderation',
    cooldown: 5,
    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.ManageMessages],

    async execute(interaction, client) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');

        await interaction.deferReply({ ephemeral: true });

        let messages = await interaction.channel.messages.fetch({ limit: amount });

        if (user) {
            messages = messages.filter((m) => m.author.id === user.id);
        }

        // Filter out messages older than 14 days
        messages = messages.filter((m) => Date.now() - m.createdTimestamp < 1209600000);

        if (messages.size === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} No deletable messages found!`)],
            });
        }

        const deleted = await interaction.channel.bulkDelete(messages, true);

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Messages Cleared`)
            .setDescription(
                `Successfully deleted **${deleted.size}** message(s)` +
                (user ? ` from ${user}` : '') + '.'
            )
            .setColor(config.colors.success)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Auto-delete reply after 5 seconds
        setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    },
};