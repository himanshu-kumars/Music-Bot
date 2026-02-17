const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit coins to your bank')
        .addStringOption((opt) => opt.setName('amount').setDescription('Amount to deposit (number or "all")').setRequired(true)),
    category: 'economy',
    cooldown: 3,

    async execute(interaction, client) {
        let data = await Economy.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!data) data = new Economy({ userId: interaction.user.id, guildId: interaction.guild.id });

        const input = interaction.options.getString('amount');
        let amount = input.toLowerCase() === 'all' ? data.wallet : parseInt(input);

        if (isNaN(amount) || amount <= 0) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Invalid amount!`)], ephemeral: true });
        }

        if (amount > data.wallet) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You don't have that much in your wallet!`)], ephemeral: true });
        }

        const spaceLeft = data.bankLimit - data.bank;
        if (amount > spaceLeft) {
            amount = spaceLeft;
        }

        if (amount <= 0) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Your bank is full!`)], ephemeral: true });
        }

        data.wallet -= amount;
        data.bank += amount;
        await data.save();

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.bank} Deposited`)
            .setDescription(
                `Successfully deposited **${config.economy.currencySymbol} ${amount.toLocaleString()}** to your bank.\n\n` +
                `${config.emojis.wallet} **Wallet:** ${config.economy.currencySymbol} ${data.wallet.toLocaleString()}\n` +
                `${config.emojis.bank} **Bank:** ${config.economy.currencySymbol} ${data.bank.toLocaleString()} / ${data.bankLimit.toLocaleString()}`
            )
            .setColor(config.colors.economy)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};