require('dotenv').config();

module.exports = {
    // Bot
    token: process.env.BOT_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,

    // Owner
    ownerId: process.env.OWNER_ID,
    ownerIds: process.env.OWNER_IDS?.split(',') || [],

    // Database
    mongoURI: process.env.MONGODB_URI,

    // Settings
    defaultPrefix: process.env.DEFAULT_PREFIX || '!',
    
    // Colors
    colors: {
        primary: process.env.EMBED_COLOR || '#2B2D31',
        success: process.env.SUCCESS_COLOR || '#57F287',
        error: process.env.ERROR_COLOR || '#ED4245',
        warning: process.env.WARNING_COLOR || '#FEE75C',
        info: '#5865F2',
        music: '#1DB954',
        economy: '#F1C40F',
        level: '#E91E63',
        ticket: '#00BCD4',
        giveaway: '#FF6B6B',
        moderation: '#FF9800',
    },

    // Emojis (Replace with your custom emoji IDs)
    emojis: {
        // Status
        success: '✅',
        error: '❌',
        warning: '⚠️',
        loading: '⏳',
        info: 'ℹ️',

        // Categories
        moderation: '🛡️',
        music: '🎵',
        fun: '🎮',
        economy: '💰',
        leveling: '📊',
        utility: '🔧',
        info_cat: 'ℹ️',
        setup: '⚙️',
        ticket: '🎫',
        giveaway: '🎉',
        image: '🖼️',
        owner: '👑',
        social: '📡',

        // Music
        play: '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        previous: '⏮️',
        loop: '🔁',
        shuffle: '🔀',
        volume: '🔊',
        queue: '📜',
        
        // Economy
        coin: '🪙',
        bank: '🏦',
        wallet: '👛',

        // Navigation
        first: '⏪',
        back: '◀️',
        next: '▶️',
        last: '⏩',
        home: '🏠',
        delete: '🗑️',

        // Misc
        crown: '👑',
        star: '⭐',
        fire: '🔥',
        sparkle: '✨',
        heart: '❤️',
        trophy: '🏆',
        medal: '🏅',
        online: '🟢',
        idle: '🟡',
        dnd: '🔴',
        offline: '⚫',
    },

    // API Keys
    apis: {
        weatherKey: process.env.WEATHER_API_KEY,
        youtubeKey: process.env.YOUTUBE_API_KEY,
        spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
        spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    },

    // Channels
    channels: {
        errorLog: process.env.ERROR_LOG_CHANNEL,
        botLog: process.env.BOT_LOG_CHANNEL,
    },

    // Dashboard
    dashboard: {
        port: process.env.DASHBOARD_PORT || 3000,
        url: process.env.DASHBOARD_URL || 'http://localhost:3000',
    },

    // Cooldowns (in seconds)
    cooldowns: {
        default: 3,
        music: 2,
        economy: 5,
        moderation: 3,
        fun: 3,
    },

    // Leveling
    leveling: {
        xpPerMessage: { min: 15, max: 25 },
        xpCooldown: 60, // seconds
        voiceXpPerMinute: 5,
    },

    // Economy
    economy: {
        currencyName: 'Coins',
        currencySymbol: '🪙',
        dailyAmount: { min: 100, max: 500 },
        weeklyAmount: { min: 1000, max: 3000 },
        workAmount: { min: 50, max: 300 },
        robChance: 40, // percent
        startingBalance: 0,
    },

    // Bot Info
    bot: {
        name: 'Ultimate Bot',
        version: '2.0.0',
        invite: 'https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands',
        support: 'https://discord.gg/your-support-server',
        website: 'https://your-website.com',
        github: 'https://github.com/your-repo',
    },
};