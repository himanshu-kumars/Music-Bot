const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder().setName('meme').setDescription('Get a random meme'),
    category: 'fun',
    cooldown: 3,

    async execute(interaction, client) {
        await interaction.deferReply();

        const subreddits = ['memes', 'dankmemes', 'wholesomememes', 'me_irl', 'programmerhumor'];
        const sub = subreddits[Math.floor(Math.random() * subreddits.length)];

        try {
            const res = await fetch(`https://www.reddit.com/r/${sub}/random/.json`);
            const data = await res.json();
            const post = data[0]?.data?.children[0]?.data;

            if (!post || post.over_18) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Couldn't find a meme. Try again!`)] });
            }

            const embed = new EmbedBuilder()
                .setTitle(post.title.slice(0, 256))
                .setURL(`https://reddit.com${post.permalink}`)
                .setImage(post.url)
                .setColor(config.colors.primary)
                .setFooter({ text: `👍 ${post.ups} | 💬 ${post.num_comments} | r/${post.subreddit}` })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('meme_next').setLabel('Next Meme').setStyle(ButtonStyle.Primary).setEmoji('😂')
            );

            const msg = await interaction.editReply({ embeds: [embed], components: [buttons] });

            const collector = msg.createMessageComponentCollector({ time: 60000, filter: (i) => i.user.id === interaction.user.id });

            collector.on('collect', async (i) => {
                try {
                    const newRes = await fetch(`https://www.reddit.com/r/${subreddits[Math.floor(Math.random() * subreddits.length)]}/random/.json`);
                    const newData = await newRes.json();
                    const newPost = newData[0]?.data?.children[0]?.data;

                    if (newPost && !newPost.over_18) {
                        const newEmbed = new EmbedBuilder()
                            .setTitle(newPost.title.slice(0, 256))
                            .setURL(`https://reddit.com${newPost.permalink}`)
                            .setImage(newPost.url)
                            .setColor(config.colors.primary)
                            .setFooter({ text: `👍 ${newPost.ups} | 💬 ${newPost.num_comments} | r/${newPost.subreddit}` })
                            .setTimestamp();
                        await i.update({ embeds: [newEmbed] });
                    }
                } catch (e) {
                    await i.reply({ content: 'Failed to load meme!', ephemeral: true });
                }
            });
        } catch (error) {
            await interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription(`${config.emojis.error} Failed to fetch meme!`)] });
        }
    },
};