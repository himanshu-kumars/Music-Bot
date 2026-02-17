const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../../config');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure the welcome system')
        .addSubcommand((sub) =>
            sub.setName('enable').setDescription('Enable welcome messages')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Welcome channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('disable').setDescription('Disable welcome messages')
        )
        .addSubcommand((sub) =>
            sub.setName('message').setDescription('Set welcome message')
                .addStringOption((opt) => opt.setName('text').setDescription('Welcome message. Variables: {user}, {server}, {memberCount}').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('test').setDescription('Test the welcome message')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    category: 'setup',
    cooldown: 5,
    userPermissions: [PermissionFlagsBits.ManageGuild],

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData) guildData = new Guild({ guildId: interaction.guild.id });

        switch (sub) {
            case 'enable': {
                const channel = interaction.options.getChannel('channel');
                guildData.welcome.enabled = true;
                guildData.welcome.channelId = channel.id;
                guildData.modules.welcome = true;
                await guildData.save();

                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle(`${config.emojis.success} Welcome System Enabled`)
                        .setDescription(`Welcome messages will be sent to ${channel}\n\nUse \`/welcome message\` to customize the message.\nUse \`/welcome test\` to preview.`)
                        .setColor(config.colors.success).setTimestamp()],
                });
                break;
            }
            case 'disable': {
                guildData.welcome.enabled = false;
                guildData.modules.welcome = false;
                await guildData.save();

                await interaction.reply({
                    embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} Welcome system disabled!`).setTimestamp()],
                });
                break;
            }
            case 'message': {
                const text = interaction.options.getString('text');
                guildData.welcome.message = text;
                await guildData.save();

                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle(`${config.emojis.success} Welcome Message Updated`)
                        .setDescription(`**New message:**\n${text.replace('{user}', interaction.user).replace('{server}', interaction.guild.name).replace('{memberCount}', interaction.guild.memberCount)}`)
                        .setColor(config.colors.success).setTimestamp()],
                });
                break;
            }
            case 'test': {
                if (!guildData.welcome.enabled || !guildData.welcome.channelId) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Welcome system is not configured! Use \`/welcome enable\` first.`)], ephemeral: true });
                }

                const channel = interaction.guild.channels.cache.get(guildData.welcome.channelId);
                if (!channel) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Welcome channel not found!`)], ephemeral: true });

                const msg = (guildData.welcome.message || 'Welcome {user} to {server}!')
                    .replace(/{user}/g, interaction.user)
                    .replace(/{server}/g, interaction.guild.name)
                    .replace(/{memberCount}/g, interaction.guild.memberCount);

                const embed = new EmbedBuilder()
                    .setTitle(`Welcome to ${interaction.guild.name}! 👋`)
                    .setDescription(msg)
                    .setColor(config.colors.success)
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: `Member #${interaction.guild.memberCount}` })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
                await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} Test welcome message sent to ${channel}!`)], ephemeral: true });
                break;
            }
        }
    },
};