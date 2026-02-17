module.exports = {
    /**
     * Create a text progress bar
     * @param {number} current - Current value
     * @param {number} total - Total value
     * @param {number} size - Bar length (default: 15)
     * @returns {string} Progress bar string
     */
    create(current, total, size = 15) {
        const percentage = current / total;
        const progress = Math.round(size * percentage);
        const emptyProgress = size - progress;

        const progressText = '▰'.repeat(progress);
        const emptyProgressText = '▱'.repeat(emptyProgress);
        const percentageText = Math.round(percentage * 100);

        return `${progressText}${emptyProgressText} ${percentageText}%`;
    },

    /**
     * Create a music progress bar
     */
    music(current, total, size = 20) {
        const percentage = current / total;
        const progress = Math.round(size * percentage);
        const emptyProgress = size - progress;

        const progressText = '━'.repeat(Math.max(0, progress - 1));
        const emptyProgressText = '━'.repeat(emptyProgress);

        return `${progressText}🔘${emptyProgressText}`;
    },

    /**
     * Create an XP progress bar
     */
    xp(current, total, size = 18) {
        const percentage = current / total;
        const progress = Math.round(size * percentage);
        const emptyProgress = size - progress;

        const filled = '█'.repeat(progress);
        const empty = '░'.repeat(emptyProgress);

        return `\`${filled}${empty}\` ${Math.round(percentage * 100)}%`;
    },
};