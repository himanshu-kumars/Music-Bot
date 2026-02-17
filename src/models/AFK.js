const { Schema, model } = require('mongoose');

const afkSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    message: { type: String, default: 'AFK' },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

afkSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = model('AFK', afkSchema);