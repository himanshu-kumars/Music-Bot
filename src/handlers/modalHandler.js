const logger = require('../utils/logger');

module.exports = async (interaction, client) => {
    const customId = interaction.customId;

    const modal = client.modals.get(customId);
    if (modal) {
        try {
            await modal.execute(interaction, client);
        } catch (error) {
            logger.error(`Modal Error (${customId}): ${error.message}`);
            const reply = {
                content: '❌ An error occurred while processing this form!',
                ephemeral: true,
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply).catch(() => {});
            } else {
                await interaction.reply(reply).catch(() => {});
            }
        }
        return;
    }

    // Handle dynamic modals
    if (customId.startsWith('ticket_feedback_')) {
        return handleTicketFeedback(interaction, client);
    }

    if (customId.startsWith('suggestion_')) {
        return handleSuggestionModal(interaction, client);
    }

    if (customId.startsWith('embed_')) {
        return handleEmbedModal(interaction, client);
    }
};

async function handleTicketFeedback(interaction, client) {
    // Handle ticket feedback modal
}

async function handleSuggestionModal(interaction, client) {
    // Handle suggestion modal
}

async function handleEmbedModal(interaction, client) {
    // Handle embed builder modal
}