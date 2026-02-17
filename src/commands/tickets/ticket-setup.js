const {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder,
    ButtonStyle, PermissionFlagsBits, ChannelType, PermissionsBitField,
} = require('discord.js');
const config = require('../../../config');
const Guild = require('../../models/Guild');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Setup the ticket system')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to send ticket panel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addRoleOption((opt) => opt.setName('support-role').setDescription('Support team role').setRequired(true))
        .addChannelOption((opt) => opt.setName('category').setDescription('Category for ticket channels').addChannelTypes(ChannelType.GuildCategory).setRequired(false))
        .addChannelOption((opt) => opt.setName('log-channel').setDescription('Ticket log channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    category: 'tickets',
    cooldown: 10,
    userPermissions: [PermissionFlagsBits.ManageGuild],

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const supportRole = interaction.options.getRole('support-role');
        const category = interaction.options.getChannel('category');
        const logChannel = interaction.options.getChannel('log-channel');

        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData) guildData = new Guild({ guildId: interaction.guild.id });

        guildData.tickets = {
            enabled: true,
            categoryId: category?.id || null,
            logChannelId: logChannel?.id || null,
            supportRoles: [supportRole.id],
            maxTickets: 3,
            ticketCount: guildData.tickets?.ticketCount || 0,
        };
        guildData.modules.tickets = true;
        await guildData.save();

        const panelEmbed = new EmbedBuilder()
            .setTitle(`${config.emojis.ticket} Support Tickets`)
            .setDescription(
                `Need help? Click the button below to create a support ticket!\n\n` +
                `${config.emojis.info} **Guidelines:**\n` +
                `> • Describe your issue clearly\n` +
                `> • Be patient, staff will respond\n` +
                `> • Don't spam or create multiple tickets\n` +
                `> • One ticket per issue`
            )
            .setColor(config.colors.ticket)
            .setFooter({ text: config.bot.name })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎫')
        );

        await channel.send({ embeds: [panelEmbed], components: [buttons] });

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`${config.emojis.success} Ticket System Setup!`)
                .setDescription(
                    `**Panel sent to:** ${channel}\n` +
                    `**Support Role:** ${supportRole}\n` +
                    `**Category:** ${category || 'Default'}\n` +
                    `**Log Channel:** ${logChannel || 'Not set'}`
                )
                .setColor(config.colors.success).setTimestamp()],
            ephemeral: true,
        });
    },

    // Handle ticket create button
    async handleButton(interaction, client) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData?.tickets?.enabled) return;

        // Check if user already has max tickets
        const existingTickets = await Ticket.countDocuments({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            status: 'open',
        });

        if (existingTickets >= (guildData.tickets.maxTickets || 3)) {
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You already have the maximum number of open tickets!`)],
                ephemeral: true,
            });
        }

        guildData.tickets.ticketCount += 1;
        await guildData.save();

        const ticketNumber = guildData.tickets.ticketCount;
        const channelName = `ticket-${ticketNumber.toString().padStart(4, '0')}`;

        // Create ticket channel
        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: guildData.tickets.categoryId || null,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AttachFiles,
                    ],
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ManageChannels,
                    ],
                },
                ...guildData.tickets.supportRoles.map((roleId) => ({
                    id: roleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                })),
            ],
        });

        // Save ticket to database
        const ticket = new Ticket({
            guildId: interaction.guild.id,
            channelId: ticketChannel.id,
            userId: interaction.user.id,
            ticketNumber,
        });
        await ticket.save();

        // Send ticket welcome message
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`${config.emojis.ticket} Ticket #${ticketNumber}`)
            .setDescription(
                `Welcome ${interaction.user}!\n\n` +
                `Please describe your issue and our support team will assist you shortly.\n` +
                `A staff member will be with you soon.`
            )
            .addFields(
                { name: '👤 Created by', value: `${interaction.user}`, inline: true },
                { name: '📅 Created at', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setColor(config.colors.ticket)
            .setTimestamp();

        const ticketButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim Ticket').setStyle(ButtonStyle.Success).setEmoji('✋')
        );

        const supportPing = guildData.tickets.supportRoles.map((r) => `<@&${r}>`).join(' ');
        await ticketChannel.send({ content: `${interaction.user} ${supportPing}`, embeds: [ticketEmbed], components: [ticketButtons] });

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} Your ticket has been created: ${ticketChannel}`)],
            ephemeral: true,
        });
    },
};