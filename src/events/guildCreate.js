const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const Guild = require('../models/Guild');
const config = require('../../config');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild, client) {
        logger.info(`📥 Joined new guild: ${guild.name} (${guild.id}) | Members: ${guild.memberCount}`);

        // Create guild data in database
        try {
            await Guild.findOneAndUpdate(
                { guildId: guild.id },
                { guildId: guild.id },
                { upsert: true, new: true }
            );
        } catch (error) {
            logger.error(`Error creating guild data: ${error.message}`);
        }

        // Send welcome message to first available channel
        const channel = guild.channels.cache.find(
            (ch) => ch.type === 0 && ch.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])
        );

        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(`👋 Thanks for adding ${config.bot.name}!`)
                .setDescription(
                    `Hey there! I'm **${config.bot.name}** — your all-in-one Discord bot!\n\n` +
                    `🔹 Use \`/help\` to see all my commands\n` +
                    `🔹 Use \`/setup\` to configure me for your server\n` +
                    `🔹 Need help? Join our [Support Server](${config.bot.support})\n\n` +
                    `**Features:**\n` +
                    `🎵 Music • 🛡️ Moderation • 💰 Economy\n` +
                    `📊 Leveling • 🎫 Tickets • 🎉 Giveaways\n` +
                    `🎮 Fun • 🖼️ Images • ⚙️ AutoMod & more!`
                )
                .setColor(config.colors.info)
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: `${config.bot.name} v${config.bot.version}` })
                .setTimestamp();

            channel.send({ embeds: [embed] }).catch(() => {});
        }

        // Log to bot log channel
        const logChannel = client.channels.cache.get(config.channels.botLog);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('📥 Joined New Guild')
                .addFields(
                    { name: 'Name', value: guild.name, inline: true },
                    { name: 'ID', value: guild.id, inline: true },
                    { name: 'Members', value: `${guild.memberCount}`, inline: true },
                    { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Total Guilds', value: `${client.guilds.cache.size}`, inline: true },
                )
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setColor('#57F287')
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    },
};