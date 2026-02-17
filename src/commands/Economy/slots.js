const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play the slot machine')
        .addIntegerOption((opt) => opt.setName('bet').setDescription('Amount to bet').setMinValue(10).setRequired(true)),
    category: 'economy',
    cooldown: 5,

    async execute(interaction, client) {
        const bet = interaction.options.getInteger('bet');

        let data = await Economy.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!data) data = new Economy({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (data.wallet < bet) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You don't have enough coins!`)], ephemeral: true });
        }

        const emojis = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔'];
        const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

        let multiplier = 0;
        let result = '';

        if (slot1 === slot2 && slot2 === slot3) {
            if (slot1 === '7️⃣') { multiplier = 10; result = '🎉 JACKPOT!!!'; }
            else if (slot1 === '💎') { multiplier = 5; result = '💎 Diamond Win!'; }
            else { multiplier = 3; result = '🎉 Triple Match!'; }
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            multiplier = 1.5;
            result = '✨ Double Match!';
        } else {
            multiplier = 0;
            result = '😢 No Match';
        }

        const winnings = Math.floor(bet * multiplier);
        data.wallet += winnings - bet;
        if (winnings > 0) data.totalEarned += winnings;
        else data.totalSpent += bet;
        await data.save();

        const embed = new EmbedBuilder()
            .setTitle('🎰 Slot Machine')
            .setDescription(
                `╔══════════╗\n` +
                `║ ${slot1} ║ ${slot2} ║ ${slot3} ║\n` +
                `╚══════════╝\n\n` +
                `**${result}**\n` +
                `**Bet:** ${config.economy.currencySymbol} ${bet.toLocaleString()}\n` +
                `**${winnings > 0 ? 'Won' : 'Lost'}:** ${config.economy.currencySymbol} ${winnings > 0 ? winnings.toLocaleString() : bet.toLocaleString()}\n` +
                `**Balance:** ${config.economy.currencySymbol} ${data.wallet.toLocaleString()}`
            )
            .setColor(winnings > 0 ? config.colors.success : config.colors.error)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};