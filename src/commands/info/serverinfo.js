const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('View detailed information about the server'),
    category: 'info',
    cooldown: 5,

    async execute(interaction, client) {
        await interaction.deferReply();
        const guild = interaction.guild;
        await guild.members.fetch().catch(() => {});

        const owner = await guild.fetchOwner();
        const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
        const forumChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildForum).size;
        const stageChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildStageVoice).size;

        const onlineMembers = guild.members.cache.filter((m) => m.presence?.status !== 'offline').size;
        const humans = guild.members.cache.filter((m) => !m.user.bot).size;
        const bots = guild.members.cache.filter((m) => m.user.bot).size;

        const boostTier = {
            0: 'None',
            1: 'Tier 1',
            2: 'Tier 2',
            3: 'Tier 3',
        };

        const verificationLevel = {
            0: 'None',
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High',
        };

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.info} ${guild.name} — Server Info`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '📋 General',
                    value: [
                        `> **Owner:** ${owner}`,
                        `> **ID:** \`${guild.id}\``,
                        `> **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                        `> **Verification:** \`${verificationLevel[guild.verificationLevel]}\``,
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: `👥 Members [${guild.memberCount}]`,
                    value: [
                        `> ${config.emojis.online} Online: \`${onlineMembers}\``,
                        `> 👤 Humans: \`${humans}\``,
                        `> 🤖 Bots: \`${bots}\``,
                    ].join('\n'),
                    inline: true,
                },
                {
                    name: `💬 Channels [${guild.channels.cache.size}]`,
                    value: [
                        `> 💬 Text: \`${textChannels}\``,
                        `> 🔊 Voice: \`${voiceChannels}\``,
                        `> 📁 Categories: \`${categories}\``,
                        `> 📋 Forums: \`${forumChannels}\``,
                        `> 🎙️ Stages: \`${stageChannels}\``,
                    ].join('\n'),
                    inline: true,
                },
                {
                    name: '✨ Boost Status',
                    value: [
                        `> **Tier:** \`${boostTier[guild.premiumTier]}\``,
                        `> **Boosts:** \`${guild.premiumSubscriptionCount || 0}\``,
                    ].join('\n'),
                    inline: true,
                },
                {
                    name: `🎭 Roles [${guild.roles.cache.size}]`,
                    value: guild.roles.cache.size > 20
                        ? `${guild.roles.cache.filter((r) => r.id !== guild.id).sort((a, b) => b.position - a.position).first(20).map((r) => r).join(', ')}... and ${guild.roles.cache.size - 20} more`
                        : guild.roles.cache.filter((r) => r.id !== guild.id).sort((a, b) => b.position - a.position).map((r) => r).join(', ') || 'None',
                    inline: false,
                },
                {
                    name: `😀 Emojis [${guild.emojis.cache.size}]`,
                    value: [
                        `> Static: \`${guild.emojis.cache.filter((e) => !e.animated).size}\``,
                        `> Animated: \`${guild.emojis.cache.filter((e) => e.animated).size}\``,
                    ].join('\n'),
                    inline: true,
                }
            )
            .setColor(config.colors.info)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

        await interaction.editReply({ embeds: [embed] });
    },
};