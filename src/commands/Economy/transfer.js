const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer coins to another user')
        .addUserOption((opt) => opt.setName('user').setDescription('User to transfer to').setRequired(true))
        .addIntegerOption((opt) => opt.setName('amount').setDescription('Amount to transfer').setMinValue(1).setRequired(true)),
    category: 'economy',
    cooldown: 5,

    async execute(interaction, client) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (target.id === interaction.user.id) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You can't transfer to yourself!`)], ephemeral: true });
        if (target.bot) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You can't transfer to a bot!`)], ephemeral: true });

        let senderData = await Economy.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!senderData) senderData = new Economy({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (senderData.wallet < amount) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You don't have enough in your wallet!`)], ephemeral: true });
        }

        let receiverData = await Economy.findOne({ userId: target.id, guildId: interaction.guild.id });
        if (!receiverData) receiverData = new Economy({ userId: target.id, guildId: interaction.guild.id });

        senderData.wallet -= amount;
        senderData.totalSpent += amount;
        receiverData.wallet += amount;
        receiverData.totalEarned += amount;

        await senderData.save();
        await receiverData.save();

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Transfer Successful`)
            .setDescription(
                `${interaction.user} transferred **${config.economy.currencySymbol} ${amount.toLocaleString()}** to ${target}\n\n` +
                `**Your new balance:** ${config.economy.currencySymbol} ${senderData.wallet.toLocaleString()}`
            )
            .setColor(config.colors.economy)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};