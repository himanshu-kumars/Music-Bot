const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const config = require('../../config');
const logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const guild = member.guild;

        try {
            const guildData = await Guild.findOne({ guildId: guild.id });
            if (!guildData) return;

            // =====================
            // Welcome System
            // =====================
            if (guildData.welcome?.enabled && guildData.welcome?.channelId) {
                const channel = guild.channels.cache.get(guildData.welcome.channelId);
                if (!channel) return;

                const message = (guildData.welcome.message || 'Welcome {user} to {server}!')
                    .replace(/{user}/g, member)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{tag}/g, member.user.tag)
                    .replace(/{server}/g, guild.name)
                    .replace(/{memberCount}/g, guild.memberCount);

                if (guildData.welcome.embedEnabled) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Welcome to ${guild.name}! 👋`)
                        .setDescription(message)
                        .setColor(config.colors.success)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ text: `Member #${guild.memberCount}` })
                        .setTimestamp();

                    // TODO: Add Canvas welcome card if imageEnabled
                    await channel.send({ embeds: [embed] }).catch(() => {});
                } else {
                    await channel.send(message).catch(() => {});
                }
            }

            // =====================
            // Auto Roles
            // =====================
            if (guildData.welcome?.autoRoles?.length > 0) {
                for (const roleId of guildData.welcome.autoRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) {
                        await member.roles.add(role).catch(() => {});
                    }
                }
            }

            // =====================
            // DM Welcome
            // =====================
            if (guildData.welcome?.dmMessage) {
                const dmMsg = guildData.welcome.dmMessage
                    .replace(/{user}/g, member.user.username)
                    .replace(/{server}/g, guild.name);

                const embed = new EmbedBuilder()
                    .setTitle(`Welcome to ${guild.name}!`)
                    .setDescription(dmMsg)
                    .setColor(config.colors.info)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setTimestamp();

                member.send({ embeds: [embed] }).catch(() => {}); // May fail if DMs closed
            }

            // =====================
            // Member Log
            // =====================
            if (guildData.logging?.memberLog) {
                const logChannel = guild.channels.cache.get(guildData.logging.memberLog);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('📥 Member Joined')
                        .setDescription(`${member} ${member.user.tag}`)
                        .addFields(
                            { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                            { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setColor('#57F287')
                        .setFooter({ text: `ID: ${member.id}` })
                        .setTimestamp();
                    logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        } catch (error) {
            logger.error(`GuildMemberAdd Error: ${error.message}`);
        }
    },
};