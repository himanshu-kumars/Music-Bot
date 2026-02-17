const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    
    // General Settings
    prefix: { type: String, default: '!' },
    language: { type: String, default: 'en' },
    premium: { type: Boolean, default: false },
    premiumExpiry: { type: Date, default: null },

    // Modules (Enable/Disable)
    modules: {
        welcome: { type: Boolean, default: false },
        goodbye: { type: Boolean, default: false },
        leveling: { type: Boolean, default: false },
        economy: { type: Boolean, default: false },
        tickets: { type: Boolean, default: false },
        moderation: { type: Boolean, default: true },
        automod: { type: Boolean, default: false },
        music: { type: Boolean, default: true },
        logging: { type: Boolean, default: false },
        starboard: { type: Boolean, default: false },
        suggestions: { type: Boolean, default: false },
    },

    // Welcome System
    welcome: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String, default: null },
        message: { type: String, default: 'Welcome {user} to {server}! You are member #{memberCount}' },
        dmMessage: { type: String, default: null },
        embedEnabled: { type: Boolean, default: true },
        imageEnabled: { type: Boolean, default: true },
        autoRoles: [{ type: String }],
    },

    // Goodbye System
    goodbye: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String, default: null },
        message: { type: String, default: '{user} has left {server}. We now have {memberCount} members.' },
        embedEnabled: { type: Boolean, default: true },
    },

    // Leveling System
    leveling: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String, default: null }, // Level up notification channel
        message: { type: String, default: '🎉 {user} has reached level **{level}**!' },
        xpRate: { type: Number, default: 1 }, // Multiplier
        ignoredChannels: [{ type: String }],
        ignoredRoles: [{ type: String }],
        roleRewards: [{
            level: { type: Number },
            roleId: { type: String },
        }],
        xpMultiplierRoles: [{
            roleId: { type: String },
            multiplier: { type: Number },
        }],
    },

    // Logging System
    logging: {
        enabled: { type: Boolean, default: false },
        modLog: { type: String, default: null },
        messageLog: { type: String, default: null },
        memberLog: { type: String, default: null },
        voiceLog: { type: String, default: null },
        serverLog: { type: String, default: null },
    },

    // AutoMod
    automod: {
        antiSpam: { type: Boolean, default: false },
        antiLink: { type: Boolean, default: false },
        antiInvite: { type: Boolean, default: false },
        antiMassMention: { type: Boolean, default: false },
        antiCaps: { type: Boolean, default: false },
        maxMentions: { type: Number, default: 5 },
        maxMessages: { type: Number, default: 5 }, // in 5 seconds
        whitelistedLinks: [{ type: String }],
        whitelistedRoles: [{ type: String }],
        whitelistedChannels: [{ type: String }],
        badWords: [{ type: String }],
    },

    // Ticket System
    tickets: {
        enabled: { type: Boolean, default: false },
        categoryId: { type: String, default: null },
        logChannelId: { type: String, default: null },
        supportRoles: [{ type: String }],
        maxTickets: { type: Number, default: 3 },
        ticketCount: { type: Number, default: 0 },
        categories: [{
            name: { type: String },
            emoji: { type: String },
            description: { type: String },
            categoryId: { type: String },
        }],
    },

    // Starboard
    starboard: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String, default: null },
        threshold: { type: Number, default: 3 },
        emoji: { type: String, default: '⭐' },
    },

    // Suggestions
    suggestions: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String, default: null },
        approvedChannelId: { type: String, default: null },
        deniedChannelId: { type: String, default: null },
        count: { type: Number, default: 0 },
    },

    // Music
    music: {
        djRole: { type: String, default: null },
        defaultVolume: { type: Number, default: 50 },
        maxQueueSize: { type: Number, default: 100 },
        twentyFourSeven: { type: Boolean, default: false },
    },

    // Disabled Commands
    disabledCommands: [{ type: String }],

}, { timestamps: true });

// Index for faster queries
guildSchema.index({ guildId: 1 });

module.exports = model('Guild', guildSchema);