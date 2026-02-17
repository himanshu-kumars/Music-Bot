const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logging')
        .setDescription('Configure logging channels')
        .addSubcommand((sub) =>
            sub.setName('modlog').setDescription('Set moderation log channel')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('messagelog').setDescription('Set message log channel (edit/delete)')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('memberlog').setDescription('Set member log channel (join/leave)')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('voicelog').setDescription('Set voice log channel')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('serverlog').setDescription('Set server log channel (role/channel changes)')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('disable').setDescription('Disable a log type')
                .addStringOption((opt) =>
                    opt.setName('type').setDescription('Log type to disable').setRequired(true)
                        .addChoices(
                            { name: 'Mod Log', value: 'modLog' },
                            { name: 'Message Log', value: 'messageLog' },
                            { name: 'Member Log', value: 'memberLog' },
                            { name: 'Voice Log', value: 'voiceLog' },
                            { name: 'Server Log', value: 'serverLog' },
                            { name: 'All', value: 'all' }
                        )
                )
        )
        .addSubcommand((sub) =>
            sub.setName('view').setDescription('View current logging configuration')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    category: 'setup',
    cooldown: 5,
    userPermissions: [PermissionFlagsBits.ManageGuild],

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData) guildData = new Guild({ guildId: interaction.guild.id });

        if (sub === 'view') {
            const embed = new EmbedBuilder()
                .setTitle('📋 Logging Configuration')
                .addFields(
                    { name: '🛡️ Mod Log', value: guildData.logging.modLog ? `<#${guildData.logging.modLog}>` : '`Not Set`', inline: true },
                    { name: '💬 Message Log', value: guildData.logging.messageLog ? `<#${guildData.logging.messageLog}>` : '`Not Set`', inline: true },
                    { name: '👥 Member Log', value: guildData.logging.memberLog ? `<#${guildData.logging.memberLog}>` : '`Not Set`', inline: true },
                    { name: '🔊 Voice Log', value: guildData.logging.voiceLog ? `<#${guildData.logging.voiceLog}>` : '`Not Set`', inline: true },
                    { name: '⚙️ Server Log', value: guildData.logging.serverLog ? `<#${guildData.logging.serverLog}>` : '`Not Set`', inline: true },
                    { name: '📊 Status', value: guildData.logging.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                )
                .setColor(config.colors.info)
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'disable') {
            const type = interaction.options.getString('type');
            if (type === 'all') {
                guildData.logging.modLog = null;
                guildData.logging.messageLog = null;
                guildData.logging.memberLog = null;
                guildData.logging.voiceLog = null;
                guildData.logging.serverLog = null;
                guildData.logging.enabled = false;
            } else {
                guildData.logging[type] = null;
            }
            await guildData.save();

            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} ${type === 'all' ? 'All logging' : type} disabled!`).setTimestamp()],
            });
        }

        // Enable specific log
        const channel = interaction.options.getChannel('channel');
        const logMap = { modlog: 'modLog', messagelog: 'messageLog', memberlog: 'memberLog', voicelog: 'voiceLog', serverlog: 'serverLog' };

        guildData.logging[logMap[sub]] = channel.id;
        guildData.logging.enabled = true;
        guildData.modules.logging = true;
        await guildData.save();

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`${config.emojis.success} Logging Updated`)
                .setDescription(`**${sub.replace('log', ' Log')}** has been set to ${channel}`)
                .setColor(config.colors.success).setTimestamp()],
        });
    },
};