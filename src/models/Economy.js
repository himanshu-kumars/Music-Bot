const { Schema, model } = require('mongoose');

const economySchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    bankLimit: { type: Number, default: 10000 },
    
    // Cooldowns
    lastDaily: { type: Date, default: null },
    lastWeekly: { type: Date, default: null },
    lastWork: { type: Date, default: null },
    lastRob: { type: Date, default: null },
    lastMonthly: { type: Date, default: null },

    // Stats
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    timesWorked: { type: Number, default: 0 },
    timesRobbed: { type: Number, default: 0 },
    robSuccesses: { type: Number, default: 0 },

    // Inventory
    inventory: [{
        itemId: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        purchasedAt: { type: Date, default: Date.now },
    }],

    // Streak
    dailyStreak: { type: Number, default: 0 },

}, { timestamps: true });

economySchema.index({ userId: 1, guildId: 1 }, { unique: true });
economySchema.index({ guildId: 1, wallet: -1 }); // Leaderboard

module.exports = model('Economy', economySchema);