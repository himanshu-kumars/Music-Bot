module.exports = {
    // Permission levels
    PERM_LEVELS: {
        USER: 0,
        MODERATOR: 1,
        ADMIN: 2,
        SERVER_OWNER: 3,
        BOT_OWNER: 4,
    },

    // Max values
    MAX: {
        EMBED_TITLE: 256,
        EMBED_DESCRIPTION: 4096,
        EMBED_FIELDS: 25,
        EMBED_FIELD_NAME: 256,
        EMBED_FIELD_VALUE: 1024,
        EMBED_FOOTER: 2048,
        EMBED_AUTHOR: 256,
        MESSAGE: 2000,
        BULK_DELETE: 100,
    },

    // Default images
    IMAGES: {
        banner: 'https://i.imgur.com/your-banner.png',
        default_avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    },

    // Regex patterns
    REGEX: {
        url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
        discord_invite: /(discord\.(gg|io|me|li|com)\/.+|discordapp\.com\/invite\/.+)/gi,
        emoji: /<?(a)?:?(\w{2,32}):(\d{17,19})>?/,
        user_mention: /<@!?(\d{17,19})>/,
        channel_mention: /<#(\d{17,19})>/,
        role_mention: /<@&(\d{17,19})>/,
        hex_color: /^#?([0-9A-F]{6})$/i,
    },

    // Leveling XP formula
    xpForLevel(level) {
        return 5 * (level ** 2) + 50 * level + 100;
    },

    totalXpForLevel(level) {
        let total = 0;
        for (let i = 0; i < level; i++) {
            total += this.xpForLevel(i);
        }
        return total;
    },
};