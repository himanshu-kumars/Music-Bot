const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

class CustomEmbed {
    /**
     * Create a standard embed
     */
    static create(options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || config.colors.primary)
            .setTimestamp();

        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.url) embed.setURL(options.url);
        if (options.author) embed.setAuthor(options.author);
        if (options.footer) {
            embed.setFooter(options.footer);
        } else {
            embed.setFooter({
                text: `${config.bot.name} • Made with ❤️`,
                iconURL: options.footerIcon || undefined,
            });
        }
        if (options.fields) embed.addFields(options.fields);

        return embed;
    }

    /**
     * Success embed
     */
    static success(description, title = null) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(title ? `${config.emojis.success} ${title}` : null)
            .setDescription(`${config.emojis.success} ${description}`)
            .setTimestamp()
            .setFooter({ text: config.bot.name });
    }

    /**
     * Error embed
     */
    static error(description, title = null) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle(title ? `${config.emojis.error} ${title}` : null)
            .setDescription(`${config.emojis.error} ${description}`)
            .setTimestamp()
            .setFooter({ text: config.bot.name });
    }

    /**
     * Warning embed
     */
    static warning(description, title = null) {
        return new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle(title ? `${config.emojis.warning} ${title}` : null)
            .setDescription(`${config.emojis.warning} ${description}`)
            .setTimestamp()
            .setFooter({ text: config.bot.name });
    }

    /**
     * Info embed
     */
    static info(description, title = null) {
        return new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(title ? `${config.emojis.info} ${title}` : null)
            .setDescription(`${config.emojis.info} ${description}`)
            .setTimestamp()
            .setFooter({ text: config.bot.name });
    }

    /**
     * Loading embed
     */
    static loading(description = 'Please wait...') {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setDescription(`${config.emojis.loading} ${description}`)
            .setTimestamp();
    }

    /**
     * Music embed
     */
    static music(options = {}) {
        return CustomEmbed.create({
            ...options,
            color: config.colors.music,
        });
    }

    /**
     * Economy embed
     */
    static economy(options = {}) {
        return CustomEmbed.create({
            ...options,
            color: config.colors.economy,
        });
    }

    /**
     * Moderation embed
     */
    static moderation(options = {}) {
        return CustomEmbed.create({
            ...options,
            color: config.colors.moderation,
        });
    }
}

module.exports = CustomEmbed;