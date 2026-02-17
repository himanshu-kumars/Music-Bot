const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View a user\'s avatar')
        .addUserOption((option) =>
            option.setName('user').setDescription('The user to view avatar of').setRequired(false)
        ),
    category: 'info',
    cooldown: 3,

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.image} ${user.tag}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setColor(member?.displayHexColor || config.colors.info)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('PNG')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ extension: 'png', size: 4096 })),
            new ButtonBuilder()
                .setLabel('JPG')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ extension: 'jpg', size: 4096 })),
            new ButtonBuilder()
                .setLabel('WEBP')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ extension: 'webp', size: 4096 }))
        );

        if (user.avatar?.startsWith('a_')) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setLabel('GIF')
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.displayAvatarURL({ extension: 'gif', size: 4096 }))
            );
        }

        await interaction.reply({ embeds: [embed], components: [buttons] });
    },
};
