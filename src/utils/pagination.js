const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require('discord.js');
const config = require('../../config');

/**
 * Create paginated embeds with buttons
 * @param {Object} interaction - Discord interaction
 * @param {Array} pages - Array of EmbedBuilder objects
 * @param {number} timeout - Timeout in milliseconds (default: 120000)
 */
async function pagination(interaction, pages, timeout = 120000) {
    if (!pages || !pages.length) return;

    if (pages.length === 1) {
        return interaction.editReply({ embeds: [pages[0]] });
    }

    let currentPage = 0;

    // Add page numbers to footers
    pages.forEach((page, index) => {
        page.setFooter({
            text: `Page ${index + 1}/${pages.length} • ${config.bot.name}`,
            iconURL: interaction.client.user.displayAvatarURL(),
        });
    });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('page_first')
            .setEmoji(config.emojis.first)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('page_back')
            .setEmoji(config.emojis.back)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('page_count')
            .setLabel(`${currentPage + 1}/${pages.length}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('page_next')
            .setEmoji(config.emojis.next)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('page_last')
            .setEmoji(config.emojis.last)
            .setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.editReply({
        embeds: [pages[currentPage]],
        components: [buttons],
    });

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: timeout,
        filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on('collect', async (i) => {
        switch (i.customId) {
            case 'page_first':
                currentPage = 0;
                break;
            case 'page_back':
                currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
                break;
            case 'page_next':
                currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
                break;
            case 'page_last':
                currentPage = pages.length - 1;
                break;
        }

        // Update buttons
        buttons.components[0].setDisabled(currentPage === 0);
        buttons.components[1].setDisabled(currentPage === 0);
        buttons.components[2].setLabel(`${currentPage + 1}/${pages.length}`);
        buttons.components[3].setDisabled(currentPage === pages.length - 1);
        buttons.components[4].setDisabled(currentPage === pages.length - 1);

        await i.update({
            embeds: [pages[currentPage]],
            components: [buttons],
        }).catch(() => {});
    });

    collector.on('end', async () => {
        buttons.components.forEach((btn) => btn.setDisabled(true));
        await message.edit({ components: [buttons] }).catch(() => {});
    });

    return message;
}

module.exports = { pagination };