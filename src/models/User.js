const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },

    // Warnings
    warnings: [{
        moderator: { type: String },
        reason: { type: String },
        date: { type: Date, default: Date.now },
    }],

    // Premium
    premium: { type: Boolean, default: false },
    premiumExpiry: { type: Date, default: null },

    // AFK
    afk: {
        status: { type: Boolean, default: false },
        message: { type: String, default: null },
        timestamp: { type: Date, default: null },
    },

}, { timestamps: true });

userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = model('User', userSchema);