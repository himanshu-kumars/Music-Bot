const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

async function initBot() {

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     🤖 STARTING ULTIMATE DISCORD BOT    ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    // ==========================================
    // Create Client
    // ==========================================
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildModeration,
        ],
        partials: [
            Partials.Channel,
            Partials.Message,
            Partials.User,
            Partials.GuildMember,
            Partials.Reaction,
        ],
        allowedMentions: {
            parse: ['users', 'roles'],
            repliedUser: true,
        },
    });

    // ==========================================
    // Collections
    // ==========================================
    client.commands = new Collection();
    client.buttons = new Collection();
    client.modals = new Collection();
    client.selectMenus = new Collection();
    client.cooldowns = new Collection();
    client.snipes = new Collection();
    client.editSnipes = new Collection();
    client.dbConnected = false;

    // Try to load config safely
    try {
        client.config = require('../config');
    } catch (e) {
        client.config = {
            defaultPrefix: process.env.DEFAULT_PREFIX || '-',
            ownerId: process.env.OWNER_ID || '',
            ownerIds: [],
            colors: { primary: '#2B2D31', success: '#57F287', error: '#ED4245', warning: '#FEE75C', info: '#5865F2', music: '#1DB954' },
            emojis: { success: '✅', error: '❌', warning: '⚠️', loading: '⏳', music: '🎵' },
            bot: { name: 'Ultimate Bot', version: '2.0.0' },
            cooldowns: { default: 3 },
            channels: {},
        };
        console.log('⚠️ config.js not found, using defaults');
    }

    // Make client globally accessible
    global.client = client;

    console.log('✅ Client created');

    // ==========================================
    // Anti-Crash System
    // ==========================================
    process.on('unhandledRejection', function(reason, promise) {
        console.log('🚨 Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', function(error) {
        console.log('🚨 Uncaught Exception:', error.message);
    });

    process.on('SIGINT', function() {
        console.log('🔴 Shutting down...');
        client.destroy();
        process.exit(0);
    });

    client.on('error', function(error) {
        console.log('Client Error:', error.message);
    });

    client.on('warn', function(warning) {
        console.log('Client Warning:', warning);
    });

    console.log('✅ Anti-crash loaded');

    // ==========================================
    // MongoDB (OPTIONAL — Skip if no URI)
    // ==========================================
    var mongoURI = process.env.MONGODB_URI || '';

    if (mongoURI && mongoURI.length > 10 && mongoURI !== 'your_mongodb_uri_here') {
        try {
            var mongoose = require('mongoose');
            mongoose.set('strictQuery', false);
            await mongoose.connect(mongoURI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ Connected to MongoDB');
            client.dbConnected = true;
        } catch (error) {
            console.log('⚠️ MongoDB failed: ' + error.message);
            console.log('⚠️ Running without database');
            client.dbConnected = false;
        }
    } else {
        console.log('⚠️ No MongoDB — Music-only mode');
        client.dbConnected = false;
    }

    // ==========================================
    // Load Commands
    // ==========================================
    var commandsPath = path.join(__dirname, 'commands');
    var totalCommands = 0;

    if (fs.existsSync(commandsPath)) {
        var categories = fs.readdirSync(commandsPath).filter(function(file) {
            return fs.statSync(path.join(commandsPath, file)).isDirectory();
        });

        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            var categoryPath = path.join(commandsPath, category);
            var commandFiles = fs.readdirSync(categoryPath).filter(function(file) {
                return file.endsWith('.js');
            });

            for (var j = 0; j < commandFiles.length; j++) {
                var file = commandFiles[j];
                try {
                    var filePath = path.join(categoryPath, file);
                    var command = require(filePath);

                    if (command.data && command.execute) {
                        command.category = category;
                        command.filePath = filePath;
                        client.commands.set(command.data.name, command);
                        totalCommands++;
                    } else {
                        console.log('⚠️ ' + category + '/' + file + ' — missing data or execute');
                    }
                } catch (error) {
                    console.log('❌ ' + category + '/' + file + ' — ' + error.message);
                }
            }
        }

        console.log('✅ Loaded ' + totalCommands + ' commands from ' + categories.length + ' categories');
    } else {
        console.log('⚠️ No commands folder found at: ' + commandsPath);
    }

    // ==========================================
    // Load Events
    // ==========================================
    var eventsPath = path.join(__dirname, 'events');
    var totalEvents = 0;

    if (fs.existsSync(eventsPath)) {
        var eventFiles = fs.readdirSync(eventsPath).filter(function(file) {
            return file.endsWith('.js');
        });

        for (var k = 0; k < eventFiles.length; k++) {
            var eventFile = eventFiles[k];
            try {
                var eventPath = path.join(eventsPath, eventFile);
                var event = require(eventPath);

                if (event.name && event.execute) {
                    if (event.once) {
                        client.once(event.name, function() {
                            var args = Array.from(arguments);
                            event.execute.apply(null, args.concat([client]));
                        });
                    } else {
                        (function(evt) {
                            client.on(evt.name, function() {
                                var args = Array.from(arguments);
                                evt.execute.apply(null, args.concat([client]));
                            });
                        })(event);
                    }
                    totalEvents++;
                    console.log('  ✅ ' + event.name);
                } else {
                    console.log('  ⚠️ ' + eventFile + ' — missing name or execute');
                }
            } catch (error) {
                console.log('  ❌ ' + eventFile + ' — ' + error.message);
            }
        }

        console.log('✅ Loaded ' + totalEvents + ' events');
    } else {
        console.log('⚠️ No events folder found at: ' + eventsPath);
    }

    // ==========================================
    // Music Player Setup
    // ==========================================
    try {
        var discordPlayer = require('discord-player');
        var Player = discordPlayer.Player;
        var extractors = require('@discord-player/extractor');

        var player = new Player(client, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
            },
        });

        await player.extractors.loadMulti(extractors.DefaultExtractors);

        player.events.on('playerStart', function(queue, track) {
            var discord = require('discord.js');
            var embed = new discord.EmbedBuilder()
                .setTitle('▶️ Now Playing')
                .setDescription('[' + track.title + '](' + track.url + ')')
                .addFields(
                    { name: '👤 Artist', value: '`' + track.author + '`', inline: true },
                    { name: '⏱️ Duration', value: '`' + track.duration + '`', inline: true },
                    { name: '🎧 Requested by', value: '' + track.requestedBy, inline: true }
                )
                .setThumbnail(track.thumbnail)
                .setColor('#1DB954')
                .setTimestamp();

            if (queue.metadata && queue.metadata.channel) {
                queue.metadata.channel.send({ embeds: [embed] }).catch(function() {});
            }
        });

        player.events.on('emptyQueue', function(queue) {
            if (queue.metadata && queue.metadata.channel) {
                queue.metadata.channel.send('📭 Queue empty! Use `/play` to add songs.').catch(function() {});
            }
        });

        player.events.on('emptyChannel', function(queue) {
            if (queue.metadata && queue.metadata.channel) {
                queue.metadata.channel.send('👋 Left — voice channel was empty.').catch(function() {});
            }
        });

        player.events.on('error', function(queue, error) {
            console.log('Player Error: ' + error.message);
        });

        player.events.on('playerError', function(queue, error) {
            console.log('Player Error: ' + error.message);
        });

        console.log('✅ Music player initialized');
    } catch (error) {
        console.log('⚠️ Music player failed: ' + error.message);
        console.log('   Run: npm install discord-player @discord-player/extractor');
    }

    // ==========================================
    // Login
    // ==========================================
    var token = process.env.BOT_TOKEN || '';

    if (!token || token === 'your_bot_token_here') {
        console.log('❌ No BOT_TOKEN in .env file!');
        process.exit(1);
    }

    try {
        await client.login(token);
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║     🤖 BOT IS ONLINE AND READY!         ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        console.log('🤖 Logged in as: ' + client.user.tag);
        console.log('📊 Servers: ' + client.guilds.cache.size);
        console.log('📂 Commands: ' + client.commands.size);
        console.log('🏓 Ping: ' + client.ws.ping + 'ms');
        console.log('');
    } catch (error) {
        console.log('❌ Login failed: ' + error.message);
        process.exit(1);
    }

    return client;
}

module.exports = { initBot: initBot };