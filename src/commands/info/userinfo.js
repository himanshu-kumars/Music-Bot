const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('View information about a user')
        .addUserOption((option) =>
            option.setName('user').setDescription('The user to view info for').setRequired(false)
        ),
    category: 'info',
    cooldown: 3,

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const statusEmojis = {
            online: config.emojis.online,
            idle: config.emojis.idle,
            dnd: config.emojis.dnd,
            offline: config.emojis.offline,
        };

        const badges = {
            Staff: '👨‍💼',
            Partner: '🤝',
            Hypesquad: '🏠',
            BugHunterLevel1: '🐛',
            BugHunterLevel2: '🐛',
            HypeSquadOnlineHouse1: '<:bravery:>',
            HypeSquadOnlineHouse2: '<:brilliance:>',
            HypeSquadOnlineHouse3: '<:balance:>',
            PremiumEarlySupporter: '👑',
            VerifiedDeveloper: '👨‍💻',
            CertifiedModerator: '🛡️',
            ActiveDeveloper: '💻',
        };

        const userBadges = user.flags?.toArray().map((flag) => badges[flag] || flag).join(' ') || 'None';

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.info} User Info — ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '👤 User',
                    value: [
                        `> **Username:** ${user.tag}`,
                        `> **ID:** \`${user.id}\``,
                        `> **Bot:** \`${user.bot ? 'Yes' : 'No'}\``,
                        `> **Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
                        `> **Badges:** ${userBadges}`,
                    ].join('\n'),
                    inline: false,
                }
            )
            .setColor(member?.displayHexColor || config.colors.info)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (member) {
            const status = member.presence?.status || 'offline';
            const roles = member.roles.cache
                .filter((r) => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map((r) => r)
                .slice(0, 15);

            embed.addFields(
                {
                    name: '📋 Member',
                    value: [
                        `> **Nickname:** \`${member.nickname || 'None'}\``,
                        `> **Status:** ${statusEmojis[status]} \`${status}\``,
                        `> **Joined:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                        `> **Highest Role:** ${member.roles.highest}`,
                        `> **Color:** \`${member.displayHexColor}\``,
                        `> **Boosting:** ${member.premiumSince ? `Since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : '`No`'}`,
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: `🎭 Roles [${member.roles.cache.size - 1}]`,
                    value: roles.length > 0 ? roles.join(', ') + (member.roles.cache.size - 1 > 15 ? ` +${member.roles.cache.size - 16} more` : '') : 'None',
                    inline: false,
                }
            );

            if (member.presence?.activities?.length > 0) {
                const activity = member.presence.activities[0];
                embed.addFields({
                    name: '🎮 Activity',
                    value: `> **${activity.type === 0 ? 'Playing' : activity.type === 1 ? 'Streaming' : activity.type === 2 ? 'Listening' : activity.type === 3 ? 'Watching' : 'Custom'}:** ${activity.name}`,
                    inline: false,
                });
            }
        }

        if (user.bannerURL()) {
            embed.setImage(user.bannerURL({ dynamic: true, size: 512 }));
        }

        await interaction.reply({ embeds: [embed] });
    },
};