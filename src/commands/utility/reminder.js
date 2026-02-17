const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const Reminder = require('../../models/Reminder');
const { parseTime, formatDuration } = require('../../utils/formatTime');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Set a reminder')
        .addStringOption((opt) => opt.setName('time').setDescription('When to remind you (e.g., 1h, 30m, 1d)').setRequired(true))
        .addStringOption((opt) => opt.setName('message').setDescription('Reminder message').setRequired(true)),
    category: 'utility',
    cooldown: 5,

    async execute(interaction, client) {
        const timeStr = interaction.options.getString('time');
        const message = interaction.options.getString('message');

        const ms = parseTime(timeStr);
        if (!ms || ms < 60000 || ms > 2592000000) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Invalid time! Min: 1m, Max: 30d`)],
                ephemeral: true,
            });
        }

        const remindAt = new Date(Date.now() + ms);

        const reminder = new Reminder({
            userId: interaction.user.id,
            channelId: interaction.channel.id,
            guildId: interaction.guild.id,
            message,
            remindAt,
        });
        await reminder.save();

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.success} Reminder Set!`)
            .setDescription(
                `I'll remind you <t:${Math.floor(remindAt.getTime() / 1000)}:R>\n\n` +
                `**Message:** ${message}`
            )
            .setColor(config.colors.success)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Set timeout for reminder
        setTimeout(async () => {
            try {
                const channel = client.channels.cache.get(interaction.channel.id);
                if (channel) {
                    const reminderEmbed = new EmbedBuilder()
                        .setTitle('⏰ Reminder!')
                        .setDescription(`${interaction.user}, here's your reminder:\n\n**${message}**`)
                        .setColor(config.colors.info)
                        .setTimestamp();
                    channel.send({ content: `${interaction.user}`, embeds: [reminderEmbed] });
                }
                await Reminder.findByIdAndDelete(reminder._id);
            } catch (e) {}
        }, ms);
    },
};