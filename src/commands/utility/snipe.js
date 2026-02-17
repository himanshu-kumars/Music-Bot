const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder().setName('snipe').setDescription('Snipe the last deleted message'),
    category: 'utility',
    cooldown: 5,

    async execute(interaction, client) {
        const snipe = client.snipes.get(interaction.channel.id);

        if (!snipe) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} There's nothing to snipe!`)],
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔫 Sniped Message')
            .setDescription(snipe.content || '*No text content*')
            .setColor(config.colors.primary)
            .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL({ dynamic: true }) })
            .setFooter({ text: `Deleted ${Math.floor((Date.now() - snipe.timestamp) / 1000)}s ago` })
            .setTimestamp(snipe.timestamp);

        if (snipe.attachments) embed.setImage(snipe.attachments);

        await interaction.reply({ embeds: [embed] });
    },
};