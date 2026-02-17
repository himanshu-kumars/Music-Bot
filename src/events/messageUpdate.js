const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage, newMessage, client) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        // Store edit snipe
        client.editSnipes.set(oldMessage.channel.id, {
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            author: oldMessage.author,
            timestamp: Date.now(),
        });

        // Message logging
        try {
            const guildData = await Guild.findOne({ guildId: oldMessage.guild.id });
            if (!guildData?.logging?.messageLog) return;

            const logChannel = oldMessage.guild.channels.cache.get(guildData.logging.messageLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('✏️ Message Edited')
                .addFields(
                    { name: 'Author', value: `${oldMessage.author} (${oldMessage.author.tag})`, inline: true },
                    { name: 'Channel', value: `${oldMessage.channel}`, inline: true },
                    { name: 'Jump to Message', value: `[Click here](${newMessage.url})`, inline: true },
                    {
                        name: 'Before',
                        value: oldMessage.content?.length > 1024
                            ? oldMessage.content.slice(0, 1020) + '...'
                            : oldMessage.content || 'No content',
                    },
                    {
                        name: 'After',
                        value: newMessage.content?.length > 1024
                            ? newMessage.content.slice(0, 1020) + '...'
                            : newMessage.content || 'No content',
                    },
                )
                .setColor('#FEE75C')
                .setFooter({ text: `Message ID: ${oldMessage.id}` })
                .setTimestamp();

            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (error) {
            // Silently fail
        }
    },
};