const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all bot commands with categories')
        .addStringOption((option) =>
            option
                .setName('command')
                .setDescription('Get info about a specific command')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    category: 'info',
    cooldown: 3,

    async autocomplete(interaction, client) {
        const focused = interaction.options.getFocused().toLowerCase();
        const commands = client.commands.map((cmd) => ({
            name: cmd.data.name,
            value: cmd.data.name,
        }));
        const filtered = commands.filter((cmd) => cmd.name.includes(focused)).slice(0, 25);
        await interaction.respond(filtered);
    },

    async execute(interaction, client) {
        const specificCommand = interaction.options.getString('command');

        if (specificCommand) {
            const command = client.commands.get(specificCommand);
            if (!command) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.colors.error)
                            .setDescription(`${config.emojis.error} Command \`${specificCommand}\` not found.`),
                    ],
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis.info} Command: /${command.data.name}`)
                .setDescription(command.data.description || 'No description')
                .addFields(
                    { name: '📂 Category', value: `\`${command.category || 'Unknown'}\``, inline: true },
                    { name: '⏱️ Cooldown', value: `\`${command.cooldown || 3}s\``, inline: true },
                    {
                        name: '🔒 Permissions',
                        value: command.userPermissions
                            ? command.userPermissions.map((p) => `\`${p}\``).join(', ')
                            : '`None`',
                        inline: true,
                    }
                )
                .setColor(config.colors.info)
                .setFooter({ text: `${config.bot.name} • Use /help for all commands`, iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            if (command.data.options?.length > 0) {
                const options = command.data.options
                    .map((opt) => `\`${opt.name}\` - ${opt.description} ${opt.required ? '(Required)' : '(Optional)'}`)
                    .join('\n');
                embed.addFields({ name: '📝 Options', value: options });
            }

            return interaction.reply({ embeds: [embed] });
        }

        // ==========================================
        // Main Help Menu
        // ==========================================
        const categories = {};
        client.commands.forEach((cmd) => {
            const cat = cmd.category || 'Uncategorized';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        });

        const categoryEmojis = {
            info: config.emojis.info_cat,
            moderation: config.emojis.moderation,
            music: config.emojis.music,
            fun: config.emojis.fun,
            economy: config.emojis.economy,
            leveling: config.emojis.leveling,
            utility: config.emojis.utility,
            setup: config.emojis.setup,
            tickets: config.emojis.ticket,
            giveaway: config.emojis.giveaway,
            image: config.emojis.image,
            owner: config.emojis.owner,
        };

        // Home page embed
        const homeEmbed = new EmbedBuilder()
            .setTitle(`${config.emojis.sparkle} ${config.bot.name} — Help Menu`)
            .setDescription(
                `Hey there! I'm **${config.bot.name}**, your all-in-one Discord bot!\n\n` +
                `Use the **dropdown menu** below to browse commands by category.\n\n` +
                `${config.emojis.info} **Total Commands:** \`${client.commands.size}\`\n` +
                `${config.emojis.fire} **Prefix:** \`/\` (Slash Commands)\n` +
                `${config.emojis.heart} **Support:** [Join Server](${config.bot.support})\n` +
                `${config.emojis.star} **Invite:** [Add Me](${config.bot.invite})\n\n` +
                `**📂 Categories:**\n` +
                Object.entries(categories)
                    .map(([cat, cmds]) => `${categoryEmojis[cat] || '📁'} **${cat.charAt(0).toUpperCase() + cat.slice(1)}** — \`${cmds.length}\` commands`)
                    .join('\n')
            )
            .setColor(config.colors.info)
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `${config.bot.name} v${config.bot.version} • Select a category below`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        // Select menu
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('📂 Select a category...')
                .addOptions(
                    {
                        label: '🏠 Home',
                        description: 'Go back to main help page',
                        value: 'home',
                        emoji: '🏠',
                    },
                    ...Object.entries(categories).map(([cat, cmds]) => ({
                        label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${cmds.length})`,
                        description: `View ${cat} commands`,
                        value: cat,
                        emoji: categoryEmojis[cat] || '📁',
                    }))
                )
        );

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
                .setEmoji('💬'),
            new ButtonBuilder()
                .setLabel('Website')
                .setStyle(ButtonStyle.Link)
                .setURL(config.bot.website)
                .setEmoji('🌐'),
            new ButtonBuilder()
                .setCustomId('help_delete')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
        );

        const message = await interaction.reply({
            embeds: [homeEmbed],
            components: [selectMenu, buttons],
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
            time: 120000,
            filter: (i) => i.user.id === interaction.user.id,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'help_delete') {
                await message.delete().catch(() => {});
                return;
            }

            if (i.customId !== 'help_select') return;

            const value = i.values[0];

            if (value === 'home') {
                await i.update({ embeds: [homeEmbed], components: [selectMenu, buttons] });
                return;
            }

            const cmds = categories[value];
            if (!cmds) return;

            const categoryEmbed = new EmbedBuilder()
                .setTitle(`${categoryEmojis[value] || '📁'} ${value.charAt(0).toUpperCase() + value.slice(1)} Commands`)
                .setDescription(
                    cmds
                        .map((cmd) => `> \`/${cmd.data.name}\` — ${cmd.data.description}`)
                        .join('\n')
                )
                .setColor(config.colors.info)
                .setFooter({
                    text: `${cmds.length} commands • ${config.bot.name}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                .setTimestamp();

            await i.update({ embeds: [categoryEmbed], components: [selectMenu, buttons] });
        });

        collector.on('end', async () => {
            selectMenu.components[0].setDisabled(true);
            buttons.components[3].setDisabled(true);
            await message.edit({ components: [selectMenu, buttons] }).catch(() => {});
        });
    },
};