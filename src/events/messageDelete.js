const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message, client) {
        if (!message.guild || message.author?.bot) return;

        // Store snipe data
        client.snipes.set(message.channel.id, {
            content: message.content,
            author: message.author,
            attachments: message.attachments.first()?.proxyURL || null,
            timestamp: Date.now(),
        });

        // Clean up old snipes after 5 minutes
        setTimeout(() => {
            const snipe = client.snipes.get(message.channel.id);
            if (snipe && Date.now() - snipe.timestamp > 300000) {
                client.snipes.delete(message.channel.id);
            }
        }, 300000);

        // Message logging
        try {
            const guildData = await Guild.findOne({ guildId: message.guild.id });
            if (!guildData?.logging?.messageLog) return;

            const logChannel = message.guild.channels.cache.get(guildData.logging.messageLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Message Deleted')
                .addFields(
                    { name: 'Author', value: `${message.author} (${message.author.tag})`, inline: true },
                    { name: 'Channel', value: `${message.channel}`, inline: true },
                )
                .setColor('#ED4245')
                .setFooter({ text: `Message ID: ${message.id}` })
                .setTimestamp();

            if (message.content) {
                embed.addFields({
                    name: 'Content',
                    value: message.content.length > 1024
                        ? message.content.slice(0, 1020) + '...'
                        : message.content,
                });
            }

            if (message.attachments.size > 0) {
                embed.addFields({
                    name: 'Attachments',
                    value: message.attachments.map((a) => a.proxyURL).join('\n'),
                });
            }

            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (error) {
            // Silently fail
        }
    },
};