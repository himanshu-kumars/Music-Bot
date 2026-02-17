const { Schema, model } = require('mongoose');

const levelSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
    voiceMinutes: { type: Number, default: 0 },
    lastXpEarned: { type: Date, default: null },
}, { timestamps: true });

levelSchema.index({ userId: 1, guildId: 1 }, { unique: true });
levelSchema.index({ guildId: 1, totalXp: -1 }); // For leaderboard queries

module.exports = model('Level', levelSchema);