const logger = require('../utils/logger');

module.exports = (client) => {
    // Unhandled Promise Rejection
    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`🚨 Unhandled Rejection:`);
        console.error(reason);

        // Log to Discord channel
        logErrorToChannel(client, 'Unhandled Rejection', reason);
    });

    // Uncaught Exception
    process.on('uncaughtException', (error, origin) => {
        logger.error(`🚨 Uncaught Exception:`);
        console.error(error);

        logErrorToChannel(client, 'Uncaught Exception', error);
    });

    // Uncaught Exception Monitor
    process.on('uncaughtExceptionMonitor', (error, origin) => {
        logger.error(`🚨 Uncaught Exception Monitor:`);
        console.error(error);
    });

    // Warning
    process.on('warning', (warning) => {
        logger.warn(`⚠️ Warning: ${warning.message}`);
    });

    // Graceful Shutdown
    process.on('SIGINT', () => {
        logger.info('🔴 Bot shutting down gracefully...');
        client.destroy();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        logger.info('🔴 Bot received SIGTERM, shutting down...');
        client.destroy();
        process.exit(0);
    });

    // Discord.js errors
    client.on('error', (error) => {
        logger.error(`Client Error: ${error.message}`);
    });

    client.on('warn', (warning) => {
        logger.warn(`Client Warning: ${warning}`);
    });

    // Shard errors (if using sharding)
    client.on('shardError', (error, shardId) => {
        logger.error(`Shard ${shardId} Error: ${error.message}`);
    });

    client.on('shardDisconnect', (event, shardId) => {
        logger.warn(`Shard ${shardId} Disconnected`);
    });

    client.on('shardReconnecting', (shardId) => {
        logger.info(`Shard ${shardId} Reconnecting...`);
    });

    logger.success('🛡️ Anti-crash system loaded');
};

async function logErrorToChannel(client, type, error) {
    try {
        const channelId = client.config?.channels?.errorLog;
        if (!channelId) return;

        const channel = client.channels.cache.get(channelId);
        if (!channel) return;

        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
            .setTitle(`🚨 ${type}`)
            .setDescription(`\`\`\`js\n${String(error?.stack || error).slice(0, 4000)}\n\`\`\``)
            .setColor('#ED4245')
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
    } catch (e) {
        // Silently fail - don't create recursive errors
    }
}