const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const logger = require('./src/utils/logger');

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');

// Load all commands
const categories = fs.readdirSync(commandsPath).filter((file) => {
    return fs.statSync(path.join(commandsPath, file)).isDirectory();
});

for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(categoryPath, file));
        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        logger.info(`🔄 Refreshing ${commands.length} application (/) commands...`);

        // Deploy globally
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );

        logger.success(`✅ Successfully registered ${data.length} global commands!`);

        // Uncomment below to deploy to a specific guild (faster for testing)
        // const data = await rest.put(
        //     Routes.applicationGuildCommands(config.clientId, config.guildId),
        //     { body: commands }
        // );
        // logger.success(`✅ Successfully registered ${data.length} guild commands!`);

    } catch (error) {
        logger.error(`Deploy Error: ${error.message}`);
        console.error(error);
    }
})();