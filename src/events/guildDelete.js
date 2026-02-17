const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const config = require('../../config');

module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(guild, client) {
        logger.warn(`📤 Left guild: ${guild.name} (${guild.id}) | Members: ${guild.memberCount}`);

        const logChannel = client.channels.cache.get(config.channels.botLog);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('📤 Left Guild')
                .addFields(
                    { name: 'Name', value: guild.name, inline: true },
                    { name: 'ID', value: guild.id, inline: true },
                    { name: 'Members', value: `${guild.memberCount}`, inline: true },
                    { name: 'Total Guilds', value: `${client.guilds.cache.size}`, inline: true },
                )
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setColor('#ED4245')
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    },
};