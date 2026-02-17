const { Collection } = require('discord.js');

const cooldowns = new Collection();

module.exports = {
    /**
     * Check if user is on cooldown
     * @returns {number|false} Remaining time in seconds, or false if not on cooldown
     */
    check(userId, commandName, cooldownSeconds = 3) {
        if (!cooldowns.has(commandName)) {
            cooldowns.set(commandName, new Collection());
        }

        const timestamps = cooldowns.get(commandName);
        const cooldownAmount = cooldownSeconds * 1000;
        const now = Date.now();

        if (timestamps.has(userId)) {
            const expirationTime = timestamps.get(userId) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return timeLeft;
            }
        }

        timestamps.set(userId, now);
        setTimeout(() => timestamps.delete(userId), cooldownAmount);
        return false;
    },

    /**
     * Set a custom cooldown
     */
    set(userId, commandName, seconds) {
        if (!cooldowns.has(commandName)) {
            cooldowns.set(commandName, new Collection());
        }
        cooldowns.get(commandName).set(userId, Date.now());
        setTimeout(() => {
            const cmd = cooldowns.get(commandName);
            if (cmd) cmd.delete(userId);
        }, seconds * 1000);
    },

    /**
     * Clear a user's cooldown for a command
     */
    clear(userId, commandName) {
        if (cooldowns.has(commandName)) {
            cooldowns.get(commandName).delete(userId);
        }
    },

    /**
     * Clear all cooldowns for a user
     */
    clearAll(userId) {
        cooldowns.forEach((timestamps) => {
            timestamps.delete(userId);
        });
    },
};