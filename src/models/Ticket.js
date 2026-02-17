const { Schema, model } = require('mongoose');

const ticketSchema = new Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    ticketNumber: { type: Number, required: true },
    category: { type: String, default: 'general' },
    status: { type: String, enum: ['open', 'closed', 'claimed'], default: 'open' },
    claimedBy: { type: String, default: null },
    closedBy: { type: String, default: null },
    closedAt: { type: Date, default: null },
    participants: [{ type: String }],
    transcript: { type: String, default: null },
    feedback: {
        rating: { type: Number, default: null },
        comment: { type: String, default: null },
    },
}, { timestamps: true });

ticketSchema.index({ guildId: 1, userId: 1 });

module.exports = model('Ticket', ticketSchema);