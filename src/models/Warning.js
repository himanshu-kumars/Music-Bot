const { Schema, model } = require('mongoose');

const warningSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, default: 'No reason provided' },
    warnId: { type: String, required: true },
}, { timestamps: true });

warningSchema.index({ guildId: 1, userId: 1 });

module.exports = model('Warning', warningSchema);