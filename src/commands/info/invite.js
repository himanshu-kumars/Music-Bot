const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the bot invite link'),
    category: 'info',
    cooldown: 3,

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.sparkle} Invite ${config.bot.name}`)
            .setDescription(
                `Thanks for wanting to invite me! Click the button below to add me to your server.\n\n` +
                `${config.emojis.star} **Features:** 200+ commands, Music, Moderation, Economy & more!`
            )
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setColor(config.colors.info)
            .setFooter({ text: config.bot.name, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Invite Me')
                .setStyle(ButtonStyle.Link)
                .setURL(config.bot.invite)
                .setEmoji('🤖'),
            new ButtonBuilder()
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL(config.bot.support)
                .setEmoji('💬')
        );

        await interaction.reply({ embeds: [embed], components: [buttons] });
    },
};