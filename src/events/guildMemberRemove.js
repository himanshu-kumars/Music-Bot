const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const config = require('../../config');
const logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member, client) {
        const guild = member.guild;

        try {
            const guildData = await Guild.findOne({ guildId: guild.id });
            if (!guildData) return;

            // =====================
            // Goodbye System
            // =====================
            if (guildData.goodbye?.enabled && guildData.goodbye?.channelId) {
                const channel = guild.channels.cache.get(guildData.goodbye.channelId);
                if (!channel) return;

                const message = (guildData.goodbye.message || '{user} has left {server}.')
                    .replace(/{user}/g, member.user.tag)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{server}/g, guild.name)
                    .replace(/{memberCount}/g, guild.memberCount);

                if (guildData.goodbye.embedEnabled) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Goodbye! 👋`)
                        .setDescription(message)
                        .setColor(config.colors.error)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ text: `Now ${guild.memberCount} members` })
                        .setTimestamp();

                    await channel.send({ embeds: [embed] }).catch(() => {});
                } else {
                    await channel.send(message).catch(() => {});
                }
            }

            // =====================
            // Member Log
            // =====================
            if (guildData.logging?.memberLog) {
                const logChannel = guild.channels.cache.get(guildData.logging.memberLog);
                if (logChannel) {
                    const roles = member.roles.cache
                        .filter((r) => r.id !== guild.id)
                        .map((r) => r)
                        .join(', ') || 'None';

                    const embed = new EmbedBuilder()
                        .setTitle('📤 Member Left')
                        .setDescription(`${member.user.tag}`)
                        .addFields(
                            { name: 'Joined', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
                            { name: 'Roles', value: roles.length > 1024 ? roles.slice(0, 1020) + '...' : roles },
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setColor('#ED4245')
                        .setFooter({ text: `ID: ${member.id} | Members: ${guild.memberCount}` })
                        .setTimestamp();
                    logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        } catch (error) {
            logger.error(`GuildMemberRemove Error: ${error.message}`);
        }
    },
};