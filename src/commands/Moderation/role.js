const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Add or remove a role from a user')
        .addSubcommand((sub) =>
            sub.setName('add').setDescription('Add a role to a user')
                .addUserOption((opt) => opt.setName('user').setDescription('User').setRequired(true))
                .addRoleOption((opt) => opt.setName('role').setDescription('Role to add').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('remove').setDescription('Remove a role from a user')
                .addUserOption((opt) => opt.setName('user').setDescription('User').setRequired(true))
                .addRoleOption((opt) => opt.setName('role').setDescription('Role to remove').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    category: 'moderation',
    cooldown: 3,
    userPermissions: [PermissionFlagsBits.ManageRoles],
    botPermissions: [PermissionFlagsBits.ManageRoles],

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} User not found!`)], ephemeral: true });

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} I cannot manage this role! It's higher than my highest role.`)], ephemeral: true });
        }

        if (role.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} You cannot manage this role!`)], ephemeral: true });
        }

        if (sub === 'add') {
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.warning).setDescription(`${config.emojis.warning} ${user} already has ${role}!`)], ephemeral: true });
            }
            await member.roles.add(role);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`${config.emojis.success} Role Added`)
                    .setDescription(`${role} has been added to ${user}`)
                    .setColor(config.colors.success).setTimestamp()]
            });
        } else {
            if (!member.roles.cache.has(role.id)) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.warning).setDescription(`${config.emojis.warning} ${user} doesn't have ${role}!`)], ephemeral: true });
            }
            await member.roles.remove(role);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`${config.emojis.success} Role Removed`)
                    .setDescription(`${role} has been removed from ${user}`)
                    .setColor(config.colors.success).setTimestamp()]
            });
        }
    },
};