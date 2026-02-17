const { Schema, model } = require('mongoose');

const customCommandSchema = new Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    response: { type: String, required: true },
    embedEnabled: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
    uses: { type: Number, default: 0 },
}, { timestamps: true });

customCommandSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = model('CustomCommand', customCommandSchema);