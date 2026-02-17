const { Schema, model } = require('mongoose');

const premiumSchema = new Schema({
    id: { type: String, required: true, unique: true }, // Can be userId or guildId
    type: { type: String, enum: ['user', 'guild'], required: true },
    plan: { type: String, enum: ['basic', 'pro', 'lifetime'], default: 'basic' },
    grantedBy: { type: String, required: true },
    expiresAt: { type: Date, default: null }, // null = lifetime
    features: [{
        name: { type: String },
        enabled: { type: Boolean, default: true },
    }],
}, { timestamps: true });

module.exports = model('Premium', premiumSchema);