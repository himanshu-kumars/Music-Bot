module.exports = {
    /**
     * Format milliseconds to readable time
     */
    formatDuration(ms) {
        if (!ms || isNaN(ms)) return '0s';

        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(' ') || '0s';
    },

    /**
     * Format seconds to MM:SS or HH:MM:SS
     */
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';

        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Format timestamp for Discord
     */
    discordTimestamp(date, style = 'R') {
        const timestamp = Math.floor(new Date(date).getTime() / 1000);
        return `<t:${timestamp}:${style}>`;
    },

    /**
     * Parse time string to milliseconds (e.g., "1d 2h 30m")
     */
    parseTime(timeString) {
        const matches = timeString.match(/(\d+)\s*([dhms])/gi);
        if (!matches) return null;

        let total = 0;
        for (const match of matches) {
            const [, num, unit] = match.match(/(\d+)\s*([dhms])/i);
            const value = parseInt(num);

            switch (unit.toLowerCase()) {
                case 'd': total += value * 86400000; break;
                case 'h': total += value * 3600000; break;
                case 'm': total += value * 60000; break;
                case 's': total += value * 1000; break;
            }
        }

        return total;
    },

    /**
     * Get relative time string
     */
    timeAgo(date) {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    },
};