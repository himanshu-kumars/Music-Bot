const { Schema, model } = require('mongoose');

const reactionRoleSchema = new Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    roles: [{
        roleId: { type: String },
        emoji: { type: String },
        label: { type: String },
        style: { type: Number, default: 1 }, // Button style
    }],
    type: { type: String, enum: ['button', 'select', 'reaction'], default: 'button' },
    mode: { type: String, enum: ['single', 'multiple'], default: 'multiple' },
}, { timestamps: true });

module.exports = model('ReactionRole', reactionRoleSchema);