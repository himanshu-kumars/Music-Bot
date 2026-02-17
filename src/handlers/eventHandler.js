const fs = require('fs');
const path = require('path');
const AsciiTable = require('ascii-table');
const logger = require('../utils/logger');

async function loadEvents(client) {
    const table = new AsciiTable('Events Loaded');
    table.setHeading('Event', 'Status');

    const eventsPath = path.join(__dirname, '..', 'events');

    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        logger.warn('📂 Events directory created');
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

    let totalEvents = 0;

    for (const file of eventFiles) {
        try {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            if (!event.name || !event.execute) {
                table.addRow(file, '❌ Missing name/execute');
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }

            totalEvents++;
            table.addRow(event.name, '✅ Loaded');
        } catch (error) {
            table.addRow(file, '❌ Error');
            logger.error(`Error loading event ${file}: ${error.message}`);
        }
    }

    console.log(table.toString());
    logger.success(`📡 Loaded ${totalEvents} events`);
}

module.exports = { loadEvents };