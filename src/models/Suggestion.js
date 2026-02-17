const { Schema, model } = require('mongoose');

const suggestionSchema = new Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    userId: { type: String, required: true },
    suggestion: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    number: { type: Number, required: true },
    reason: { type: String, default: null },
    reviewedBy: { type: String, default: null },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Suggestion', suggestionSchema);