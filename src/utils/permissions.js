const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');

module.exports = {
    /**
     * Check if user is the bot owner
     */
    isOwner(userId) {
        return (
            userId === config.ownerId ||
            config.ownerIds.includes(userId)
        );
    },

    /**
     * Check if user has a specific permission
     */
    hasPermission(member, permission) {
        if (!member) return false;
        return member.permissions.has(permission);
    },

    /**
     * Check if user is a moderator
     */
    isModerator(member) {
        if (!member) return false;
        return (
            member.permissions.has(PermissionFlagsBits.ManageMessages) ||
            member.permissions.has(PermissionFlagsBits.KickMembers) ||
            member.permissions.has(PermissionFlagsBits.BanMembers) ||
            member.permissions.has(PermissionFlagsBits.ModerateMembers)
        );
    },

    /**
     * Check if user is an admin
     */
    isAdmin(member) {
        if (!member) return false;
        return (
            member.permissions.has(PermissionFlagsBits.Administrator) ||
            member.permissions.has(PermissionFlagsBits.ManageGuild)
        );
    },

    /**
     * Check role hierarchy
     */
    checkHierarchy(executor, target) {
        if (!executor || !target) return false;
        return executor.roles.highest.position > target.roles.highest.position;
    },

    /**
     * Check bot permissions
     */
    checkBotPermissions(guild, permissions = []) {
        const botMember = guild.members.me;
        if (!botMember) return { has: false, missing: permissions };

        const missing = permissions.filter((perm) => !botMember.permissions.has(perm));
        return { has: missing.length === 0, missing };
    },

    /**
     * Get readable permission name
     */
    getPermissionName(permission) {
        const permNames = {
            [PermissionFlagsBits.Administrator]: 'Administrator',
            [PermissionFlagsBits.ManageGuild]: 'Manage Server',
            [PermissionFlagsBits.ManageRoles]: 'Manage Roles',
            [PermissionFlagsBits.ManageChannels]: 'Manage Channels',
            [PermissionFlagsBits.KickMembers]: 'Kick Members',
            [PermissionFlagsBits.BanMembers]: 'Ban Members',
            [PermissionFlagsBits.ManageMessages]: 'Manage Messages',
            [PermissionFlagsBits.MuteMembers]: 'Mute Members',
            [PermissionFlagsBits.DeafenMembers]: 'Deafen Members',
            [PermissionFlagsBits.MoveMembers]: 'Move Members',
            [PermissionFlagsBits.ModerateMembers]: 'Timeout Members',
            [PermissionFlagsBits.ManageNicknames]: 'Manage Nicknames',
            [PermissionFlagsBits.ManageEmojisAndStickers]: 'Manage Emojis',
        };
        return permNames[permission] || 'Unknown Permission';
    },
};