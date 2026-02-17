const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const AsciiTable = require('ascii-table');
const logger = require('../utils/logger');

async function loadCommands(client) {
    const table = new AsciiTable('Commands Loaded');
    table.setHeading('Command', 'Category', 'Status');

    const commandsPath = path.join(__dirname, '..', 'commands');

    // Check if commands directory exists
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        logger.warn('📂 Commands directory created');
        return;
    }

    const categories = fs.readdirSync(commandsPath).filter((file) => {
        return fs.statSync(path.join(commandsPath, file)).isDirectory();
    });

    let totalCommands = 0;

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const filePath = path.join(categoryPath, file);
                const command = require(filePath);

                if (!command.data || !command.execute) {
                    table.addRow(file, category, '❌ Missing data/execute');
                    logger.warn(`⚠️ Command ${file} missing 'data' or 'execute'`);
                    continue;
                }

                // Set category
                command.category = category;
                command.filePath = filePath;

                // Add to collection
                client.commands.set(command.data.name, command);
                totalCommands++;

                table.addRow(command.data.name, category, '✅ Loaded');
            } catch (error) {
                table.addRow(file, category, '❌ Error');
                logger.error(`Error loading command ${file}: ${error.message}`);
            }
        }
    }

    console.log(table.toString());
    logger.success(`📦 Loaded ${totalCommands} commands from ${categories.length} categories`);
}

async function reloadCommand(client, commandName) {
    const command = client.commands.get(commandName);
    if (!command) return { success: false, message: 'Command not found' };

    try {
        delete require.cache[require.resolve(command.filePath)];
        const newCommand = require(command.filePath);
        newCommand.category = command.category;
        newCommand.filePath = command.filePath;
        client.commands.set(newCommand.data.name, newCommand);
        return { success: true, message: `Command ${commandName} reloaded` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

module.exports = { loadCommands, reloadCommand };