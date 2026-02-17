const logger = require('../utils/logger');

module.exports = async (interaction, client) => {
    const customId = interaction.customId;

    // Check for registered button handlers
    const button = client.buttons.get(customId);
    if (button) {
        try {
            await button.execute(interaction, client);
        } catch (error) {
            logger.error(`Button Error (${customId}): ${error.message}`);
            const reply = {
                content: '❌ An error occurred while processing this button!',
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

    // Handle dynamic buttons (tickets, giveaways, etc.)
    if (customId.startsWith('ticket_')) {
        return handleTicketButton(interaction, client);
    }

    if (customId.startsWith('giveaway_')) {
        return handleGiveawayButton(interaction, client);
    }

    if (customId.startsWith('role_')) {
        return handleReactionRoleButton(interaction, client);
    }

    if (customId.startsWith('page_')) {
        return; // Handled by pagination utility
    }
};

async function handleTicketButton(interaction, client) {
    const action = interaction.customId.split('_')[1];
    try {
        switch (action) {
            case 'create':
                const ticketCreate = require('../commands/tickets/ticket-setup');
                if (ticketCreate.handleButton) await ticketCreate.handleButton(interaction, client);
                break;
            case 'close':
                const ticketClose = require('../commands/tickets/ticket-close');
                if (ticketClose.handleButton) await ticketClose.handleButton(interaction, client);
                break;
            case 'claim':
                const ticketClaim = require('../commands/tickets/ticket-claim');
                if (ticketClaim.handleButton) await ticketClaim.handleButton(interaction, client);
                break;
        }
    } catch (error) {
        logger.error(`Ticket Button Error: ${error.message}`);
    }
}

async function handleGiveawayButton(interaction, client) {
    // Giveaway button handling
}

async function handleReactionRoleButton(interaction, client) {
    // Reaction role button handling
}