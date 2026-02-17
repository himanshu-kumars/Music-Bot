const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.startup();
        logger.success(`🤖 Logged in as ${client.user.tag}`);
        logger.info(`📊 Serving ${client.guilds.cache.size} servers`);
        logger.info(`👥 Watching ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`);
        logger.info(`📂 Loaded ${client.commands.size} commands`);
        logger.info(`🏓 Ping: ${client.ws.ping}ms`);

        // Rotating Status
        const activities = [
            { name: `/help | ${client.guilds.cache.size} servers`, type: ActivityType.Playing },
            { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, type: ActivityType.Watching },
            { name: '🎵 Music 24/7', type: ActivityType.Listening },
            { name: '/help for commands', type: ActivityType.Playing },
            { name: 'your server', type: ActivityType.Watching },
            { name: `v${client.config.bot.version}`, type: ActivityType.Playing },
        ];

        let i = 0;
        setInterval(() => {
            // Update guild count in activities
            activities[0].name = `/help | ${client.guilds.cache.size} servers`;
            activities[1].name = `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`;

            client.user.setPresence({
                activities: [activities[i % activities.length]],
                status: 'online',
            });
            i++;
        }, 15000); // Change every 15 seconds
    },
};