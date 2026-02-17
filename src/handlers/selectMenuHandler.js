const logger = require('../utils/logger');

module.exports = async (interaction, client) => {
    const customId = interaction.customId;

    const selectMenu = client.selectMenus.get(customId);
    if (selectMenu) {
        try {
            await selectMenu.execute(interaction, client);
        } catch (error) {
            logger.error(`Select Menu Error (${customId}): ${error.message}`);
            const reply = {
                content: '❌ An error occurred while processing this selection!',
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

    // Handle dynamic select menus
    if (customId === 'help_category') {
        return handleHelpCategory(interaction, client);
    }

    if (customId.startsWith('reactionrole_')) {
        return handleReactionRoleSelect(interaction, client);
    }
};

async function handleHelpCategory(interaction, client) {
    // Handled inside the help command
}

async function handleReactionRoleSelect(interaction, client) {
    // Handle reaction role select menu
}