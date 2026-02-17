const logger = require('../utils/logger');
const Guild = require('../models/Guild');
const AFK = require('../models/AFK');
const CustomEmbed = require('../utils/embed');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // =====================
        // AFK System Check
        // =====================
        await handleAFK(message, client);

        // =====================
        // AutoMod Check
        // =====================
        await handleAutoMod(message, client);

        // =====================
        // Leveling System
        // =====================
        await handleLeveling(message, client);

        // =====================
        // Custom Commands
        // =====================
        await handleCustomCommands(message, client);

        // =====================
        // Counting System
        // =====================
        // Can be added later

        // =====================
        // Prefix Commands (Legacy)
        // =====================
        const guildData = await Guild.findOne({ guildId: message.guild.id });
        const prefix = guildData?.prefix || client.config.defaultPrefix;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Find command
        const command = client.commands.find(
            (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
        );

        if (command && command.prefixExecute) {
            try {
                await command.prefixExecute(message, args, client);
            } catch (error) {
                logger.error(`Prefix Command Error (${commandName}): ${error.message}`);
                message.reply({
                    embeds: [CustomEmbed.error('An error occurred while executing this command.')],
                }).catch(() => {});
            }
        }
    },
};

async function handleAFK(message, client) {
    // Check if message author is AFK - remove AFK
    const afkData = await AFK.findOne({
        userId: message.author.id,
        guildId: message.guild.id,
    });

    if (afkData) {
        await AFK.deleteOne({ userId: message.author.id, guildId: message.guild.id });
        const embed = CustomEmbed.success(
            `Welcome back, ${message.author}! I've removed your AFK status.`
        );
        message.reply({ embeds: [embed] }).then((msg) => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});

        // Reset nickname if changed
        if (message.member.displayName.startsWith('[AFK]')) {
            message.member.setNickname(
                message.member.displayName.replace('[AFK] ', '')
            ).catch(() => {});
        }
    }

    // Check if mentioned users are AFK
    if (message.mentions.users.size > 0) {
        for (const [userId, user] of message.mentions.users) {
            const mentionedAfk = await AFK.findOne({
                userId: userId,
                guildId: message.guild.id,
            });

            if (mentionedAfk) {
                const embed = CustomEmbed.info(
                    `**${user.tag}** is currently AFK: ${mentionedAfk.message}\n*Since <t:${Math.floor(mentionedAfk.timestamp.getTime() / 1000)}:R>*`
                );
                message.reply({ embeds: [embed] }).then((msg) => {
                    setTimeout(() => msg.delete().catch(() => {}), 8000);
                }).catch(() => {});
            }
        }
    }
}

async function handleAutoMod(message, client) {
    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.automod) return;
    const automod = guildData.automod;

    // Check if user is whitelisted
    const memberRoles = message.member.roles.cache.map((r) => r.id);
    if (automod.whitelistedRoles?.some((r) => memberRoles.includes(r))) return;
    if (automod.whitelistedChannels?.includes(message.channel.id)) return;
    if (message.member.permissions.has('ManageMessages')) return;

    // Anti-Link
    if (automod.antiLink) {
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/gi;
        if (urlRegex.test(message.content)) {
            const isWhitelisted = automod.whitelistedLinks?.some((link) =>
                message.content.toLowerCase().includes(link.toLowerCase())
            );
            if (!isWhitelisted) {
                await message.delete().catch(() => {});
                message.channel.send({
                    embeds: [CustomEmbed.warning(`${message.author}, links are not allowed here!`)],
                }).then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000));
                return;
            }
        }
    }

    // Anti-Invite
    if (automod.antiInvite) {
        const inviteRegex = /(discord\.(gg|io|me|li|com)\/.+|discordapp\.com\/invite\/.+)/gi;
        if (inviteRegex.test(message.content)) {
            await message.delete().catch(() => {});
            message.channel.send({
                embeds: [CustomEmbed.warning(`${message.author}, Discord invites are not allowed!`)],
            }).then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000));
            return;
        }
    }

    // Anti-Mass Mention
    if (automod.antiMassMention) {
        if (message.mentions.users.size > (automod.maxMentions || 5)) {
            await message.delete().catch(() => {});
            message.channel.send({
                embeds: [CustomEmbed.warning(`${message.author}, mass mentions are not allowed!`)],
            }).then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000));
            return;
        }
    }

    // Bad Words Filter
    if (automod.badWords?.length > 0) {
        const content = message.content.toLowerCase();
        const hasBadWord = automod.badWords.some((word) =>
            content.includes(word.toLowerCase())
        );
        if (hasBadWord) {
            await message.delete().catch(() => {});
            message.channel.send({
                embeds: [CustomEmbed.warning(`${message.author}, watch your language!`)],
            }).then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000));
            return;
        }
    }
}

async function handleLeveling(message, client) {
    try {
        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData?.modules?.leveling) return;

        // Check ignored channels/roles
        if (guildData.leveling?.ignoredChannels?.includes(message.channel.id)) return;
        const memberRoles = message.member.roles.cache.map((r) => r.id);
        if (guildData.leveling?.ignoredRoles?.some((r) => memberRoles.includes(r))) return;

        const Level = require('../models/Level');
        const constants = require('../utils/constants');

        let userData = await Level.findOne({
            userId: message.author.id,
            guildId: message.guild.id,
        });

        if (!userData) {
            userData = new Level({
                userId: message.author.id,
                guildId: message.guild.id,
            });
        }

        // Cooldown check (60 seconds)
        const cooldownMs = (client.config.leveling.xpCooldown || 60) * 1000;
        if (userData.lastXpEarned && Date.now() - userData.lastXpEarned.getTime() < cooldownMs) {
            return;
        }

        // Calculate XP to give
        const { min, max } = client.config.leveling.xpPerMessage;
        let xpToGive = Math.floor(Math.random() * (max - min + 1)) + min;

        // Apply multiplier
        const xpRate = guildData.leveling?.xpRate || 1;
        xpToGive = Math.floor(xpToGive * xpRate);

        // Role multiplier
        if (guildData.leveling?.xpMultiplierRoles?.length > 0) {
            for (const mr of guildData.leveling.xpMultiplierRoles) {
                if (memberRoles.includes(mr.roleId)) {
                    xpToGive = Math.floor(xpToGive * mr.multiplier);
                    break;
                }
            }
        }

        userData.xp += xpToGive;
        userData.totalXp += xpToGive;
        userData.messageCount += 1;
        userData.lastXpEarned = new Date();

        // Check level up
        const requiredXp = constants.xpForLevel(userData.level);
        if (userData.xp >= requiredXp) {
            userData.level += 1;
            userData.xp -= requiredXp;

            // Send level up message
            const levelChannel = guildData.leveling?.channelId
                ? message.guild.channels.cache.get(guildData.leveling.channelId)
                : message.channel;

            if (levelChannel) {
                const lvlMsg = (guildData.leveling?.message || '🎉 {user} has reached level **{level}**!')
                    .replace('{user}', message.author)
                    .replace('{level}', userData.level)
                    .replace('{server}', message.guild.name);

                const embed = CustomEmbed.create({
                    color: client.config.colors.level,
                    description: lvlMsg,
                    thumbnail: message.author.displayAvatarURL({ dynamic: true }),
                });

                levelChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Check role rewards
            if (guildData.leveling?.roleRewards?.length > 0) {
                const reward = guildData.leveling.roleRewards.find(
                    (r) => r.level === userData.level
                );
                if (reward) {
                    const role = message.guild.roles.cache.get(reward.roleId);
                    if (role) {
                        message.member.roles.add(role).catch(() => {});
                    }
                }
            }
        }

        await userData.save();
    } catch (error) {
        // Silently fail - don't disrupt message flow
    }
}

async function handleCustomCommands(message, client) {
    try {
        const guildData = await Guild.findOne({ guildId: message.guild.id });
        const prefix = guildData?.prefix || client.config.defaultPrefix;

        if (!message.content.startsWith(prefix)) return;

        const commandName = message.content.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
        const CustomCommand = require('../models/CustomCommand');

        const customCmd = await CustomCommand.findOne({
            guildId: message.guild.id,
            name: commandName,
        });

        if (customCmd) {
            customCmd.uses += 1;
            await customCmd.save();

            const response = customCmd.response
                .replace('{user}', message.author)
                .replace('{server}', message.guild.name)
                .replace('{channel}', message.channel)
                .replace('{memberCount}', message.guild.memberCount);

            if (customCmd.embedEnabled) {
                const embed = CustomEmbed.create({ description: response });
                message.reply({ embeds: [embed] });
            } else {
                message.reply(response);
            }
        }
    } catch (error) {
        // Silently fail
    }
}