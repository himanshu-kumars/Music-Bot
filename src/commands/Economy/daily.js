const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily reward'),
    category: 'economy',
    cooldown: 5,

    async execute(interaction, client) {
        let data = await Economy.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!data) {
            data = new Economy({ userId: interaction.user.id, guildId: interaction.guild.id });
        }

        const now = new Date();
        const lastDaily = data.lastDaily;

        if (lastDaily) {
            const diff = now - lastDaily;
            if (diff < 86400000) {
                const remaining = 86400000 - diff;
                const hours = Math.floor(remaining / 3600000);
                const minutes = Math.floor((remaining % 3600000) / 60000);
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(config.colors.error)
                        .setDescription(`${config.emojis.error} You already claimed your daily! Come back in **${hours}h ${minutes}m**`)],
                    ephemeral: true,
                });
            }

            // Check streak
            const hoursSince = diff / 3600000;
            if (hoursSince < 48) {
                data.dailyStreak += 1;
            } else {
                data.dailyStreak = 1;
            }
        } else {
            data.dailyStreak = 1;
        }

        const { min, max } = config.economy.dailyAmount;
        let amount = Math.floor(Math.random() * (max - min + 1)) + min;

        // Streak bonus
        const streakBonus = Math.floor(amount * (data.dailyStreak * 0.1));
        amount += streakBonus;

        data.wallet += amount;
        data.totalEarned += amount;
        data.lastDaily = now;
        await data.save();

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.coin} Daily Reward Claimed!`)
            .setDescription(
                `You received **${config.economy.currencySymbol} ${amount.toLocaleString()}**!\n\n` +
                `${config.emojis.fire} **Streak:** ${data.dailyStreak} day(s)\n` +
                `${config.emojis.sparkle} **Streak Bonus:** +${config.economy.currencySymbol} ${streakBonus.toLocaleString()}\n` +
                `${config.emojis.wallet} **New Balance:** ${config.economy.currencySymbol} ${data.wallet.toLocaleString()}`
            )
            .setColor(config.colors.economy)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};