const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');
const Guild = require('../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Configure auto-role for new members')
        .addSubcommand((sub) =>
            sub.setName('add').setDescription('Add an auto-role')
                .addRoleOption((opt) => opt.setName('role').setDescription('Role to auto-assign').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('remove').setDescription('Remove an auto-role')
                .addRoleOption((opt) => opt.setName('role').setDescription('Role to remove').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub.setName('list').setDescription('View all auto-roles')
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
            case 'add': {
                const role = interaction.options.getRole('role');
                if (guildData.welcome.autoRoles.includes(role.id)) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} ${role} is already an auto-role!`)], ephemeral: true });
                }
                guildData.welcome.autoRoles.push(role.id);
                await guildData.save();
                await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} ${role} has been added as an auto-role!`).setTimestamp()] });
                break;
            }
            case 'remove': {
                const role = interaction.options.getRole('role');
                guildData.welcome.autoRoles = guildData.welcome.autoRoles.filter((r) => r !== role.id);
                await guildData.save();
                await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`${config.emojis.success} ${role} has been removed from auto-roles!`).setTimestamp()] });
                break;
            }
            case 'list': {
                const roles = guildData.welcome.autoRoles.map((r) => `<@&${r}>`).join('\n') || 'No auto-roles set.';
                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle('⚙️ Auto-Roles')
                        .setDescription(roles)
                        .setColor(config.colors.info).setTimestamp()],
                });
                break;
            }
        }
    },
};