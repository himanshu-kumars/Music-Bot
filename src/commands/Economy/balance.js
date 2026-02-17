const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or someone\'s balance')
        .addUserOption((opt) => opt.setName('user').setDescription('User to check').setRequired(false)),
    category: 'economy',
    cooldown: 3,

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;

        let data = await Economy.findOne({ userId: user.id, guildId: interaction.guild.id });
        if (!data) {
            data = new Economy({ userId: user.id, guildId: interaction.guild.id });
            await data.save();
        }

        const total = data.wallet + data.bank;
        const net = data.totalEarned - data.totalSpent;

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.coin} ${user.username}'s Balance`)
            .addFields(
                { name: `${config.emojis.wallet} Wallet`, value: `\`${config.economy.currencySymbol} ${data.wallet.toLocaleString()}\``, inline: true },
                { name: `${config.emojis.bank} Bank`, value: `\`${config.economy.currencySymbol} ${data.bank.toLocaleString()}\``, inline: true },
                { name: '💎 Total', value: `\`${config.economy.currencySymbol} ${total.toLocaleString()}\``, inline: true },
                { name: '📊 Net Worth', value: `\`${config.economy.currencySymbol} ${net.toLocaleString()}\``, inline: true },
                { name: '📈 Bank Limit', value: `\`${config.economy.currencySymbol} ${data.bankLimit.toLocaleString()}\``, inline: true },
                { name: '🔥 Daily Streak', value: `\`${data.dailyStreak} days\``, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(config.colors.economy)
            .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};