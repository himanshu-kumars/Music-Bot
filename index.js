/**
 * ╔══════════════════════════════════════════╗
 * ║     ULTIMATE DISCORD BOT v2.0.0         ║
 * ║     Built with Discord.js v14           ║
 * ║     24/7 Premium Bot                    ║
 * ╚══════════════════════════════════════════╝
 */

const { initBot } = require('./src/bot');
const express = require('express');
const config = require('./config');
const logger = require('./src/utils/logger');

// ==========================================
// Keep-Alive Server (for 24/7 hosting)
// ==========================================
const app = express();
const PORT = config.dashboard.port || 3000;

app.get('/', (req, res) => {
    res.json({
        status: '🟢 Online',
        bot: config.bot.name,
        version: config.bot.version,
        uptime: formatUptime(process.uptime()),
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/stats', (req, res) => {
    const client = global.client;
    if (!client) return res.status(503).json({ error: 'Bot not ready' });

    res.json({
        status: '🟢 Online',
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
        channels: client.channels.cache.size,
        commands: client.commands?.size || 0,
        uptime: formatUptime(process.uptime()),
        ping: `${client.ws.ping}ms`,
        memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        node: process.version,
    });
});

app.listen(PORT, () => {
    logger.info(`🌐 Keep-alive server running on port ${PORT}`);
});

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// ==========================================
// Start the Bot
// ==========================================
initBot();