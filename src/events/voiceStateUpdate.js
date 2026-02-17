const Guild = require('../models/Guild');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldState, newState, client) {
        const guild = newState.guild || oldState.guild;
        if (!guild) return;

        try {
            const guildData = await Guild.findOne({ guildId: guild.id });
            if (!guildData?.logging?.voiceLog) return;

            const logChannel = guild.channels.cache.get(guildData.logging.voiceLog);
            if (!logChannel) return;

            const member = newState.member || oldState.member;
            if (!member || member.user.bot) return;

            let embed;

            // Joined voice channel
            if (!oldState.channelId && newState.channelId) {
                embed = new EmbedBuilder()
                    .setTitle('🔊 Voice Channel Joined')
                    .setDescription(`${member} joined ${newState.channel}`)
                    .setColor('#57F287')
                    .setFooter({ text: `ID: ${member.id}` })
                    .setTimestamp();
            }

            // Left voice channel
            else if (oldState.channelId && !newState.channelId) {
                embed = new EmbedBuilder()
                    .setTitle('🔇 Voice Channel Left')
                    .setDescription(`${member} left ${oldState.channel}`)
                    .setColor('#ED4245')
                    .setFooter({ text: `ID: ${member.id}` })
                    .setTimestamp();
            }

            // Switched voice channel
            else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                embed = new EmbedBuilder()
                    .setTitle('🔀 Voice Channel Switched')
                    .setDescription(`${member} moved from ${oldState.channel} → ${newState.channel}`)
                    .setColor('#FEE75C')
                    .setFooter({ text: `ID: ${member.id}` })
                    .setTimestamp();
            }

            if (embed) {
                embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
                logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (error) {
            // Silently fail
        }
    },
};