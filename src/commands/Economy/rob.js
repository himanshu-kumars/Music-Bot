const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Economy = require('../../models/Economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Attempt to rob another user')
        .addUserOption((opt) => opt.setName('user').setDescription('User to rob').setRequired(true)),
    category: 'economy',
    cooldown: 5,

    async execute(interaction, client) {
        const target = interaction.options.getUser('user');
        if (target.id === interaction.user.id) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You can't rob yourself!`)], ephemeral: true });
        if (target.bot) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You can't rob a bot!`)], ephemeral: true });

        let robberData = await Economy.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!robberData) robberData = new Economy({ userId: interaction.user.id, guildId: interaction.guild.id });

        let victimData = await Economy.findOne({ userId: target.id, guildId: interaction.guild.id });
        if (!victimData) victimData = new Economy({ userId: target.id, guildId: interaction.guild.id });

        // Cooldown check
        if (robberData.lastRob) {
            const diff = Date.now() - robberData.lastRob.getTime();
            if (diff < 7200000) {
                const remaining = Math.floor((7200000 - diff) / 60000);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You must wait **${remaining}m** before robbing again!`)], ephemeral: true });
            }
        }

        if (victimData.wallet < 100) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} ${target.tag} doesn't have enough coins to rob!`)], ephemeral: true });
        }

        robberData.lastRob = new Date();
        robberData.timesRobbed += 1;

        const success = Math.random() * 100 < config.economy.robChance;

        if (success) {
            const stolen = Math.floor(Math.random() * Math.min(victimData.wallet, 500)) + 50;
            robberData.wallet += stolen;
            robberData.totalEarned += stolen;
            robberData.robSuccesses += 1;
            victimData.wallet -= stolen;

            await robberData.save();
            await victimData.save();

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`${config.emojis.success} Robbery Successful!`)
                    .setDescription(`You stole **${config.economy.currencySymbol} ${stolen.toLocaleString()}** from ${target}!`)
                    .setColor(config.colors.success).setTimestamp()],
            });
        } else {
            const fine = Math.floor(Math.random() * 200) + 50;
            robberData.wallet = Math.max(0, robberData.wallet - fine);

            await robberData.save();

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`${config.emojis.error} Robbery Failed!`)
                    .setDescription(`You got caught and were fined **${config.economy.currencySymbol} ${fine.toLocaleString()}**!`)
                    .setColor(config.colors.error).setTimestamp()],
            });
        }
    },
};