const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder().setName('work').setDescription('Work to earn coins'),
    category: 'economy',
    cooldown: 5,

    async execute(interaction, client) {
        let data = await Economy.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!data) {
            data = new Economy({ userId: interaction.user.id, guildId: interaction.guild.id });
        }

        if (data.lastWork) {
            const diff = Date.now() - data.lastWork.getTime();
            if (diff < 3600000) {
                const remaining = 3600000 - diff;
                const minutes = Math.floor(remaining / 60000);
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You're tired! Come back in **${minutes}m**`)],
                    ephemeral: true,
                });
            }
        }

        const jobs = [
            { job: '👨‍💻 Software Developer', message: 'You wrote code for a company' },
            { job: '👨‍🍳 Chef', message: 'You cooked meals at a restaurant' },
            { job: '🎨 Artist', message: 'You painted a beautiful portrait' },
            { job: '📸 Photographer', message: 'You took amazing photos at a wedding' },
            { job: '🏗️ Construction Worker', message: 'You built a house' },
            { job: '🎵 Musician', message: 'You performed at a concert' },
            { job: '✈️ Pilot', message: 'You flew a plane across the country' },
            { job: '🧑‍🏫 Teacher', message: 'You taught students at a school' },
            { job: '🧑‍⚕️ Doctor', message: 'You saved lives at the hospital' },
            { job: '🛒 Cashier', message: 'You worked a shift at the store' },
            { job: '📦 Delivery Driver', message: 'You delivered packages around town' },
            { job: '🧹 Janitor', message: 'You cleaned the office building' },
        ];

        const selected = jobs[Math.floor(Math.random() * jobs.length)];
        const { min, max } = config.economy.workAmount;
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;

        data.wallet += amount;
        data.totalEarned += amount;
        data.timesWorked += 1;
        data.lastWork = new Date();
        await data.save();

        const embed = new EmbedBuilder()
            .setTitle(`${selected.job}`)
            .setDescription(
                `${selected.message} and earned **${config.economy.currencySymbol} ${amount.toLocaleString()}**!\n\n` +
                `${config.emojis.wallet} **Wallet:** ${config.economy.currencySymbol} ${data.wallet.toLocaleString()}`
            )
            .setColor(config.colors.economy)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};