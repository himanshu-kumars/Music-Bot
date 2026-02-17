const chalk = require('chalk');
const moment = require('moment');

const getTimestamp = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss');
};

const logger = {
    info: (message) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.cyan(' [INFO] ') +
            chalk.white(message)
        );
    },

    success: (message) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.green(' [SUCCESS] ') +
            chalk.white(message)
        );
    },

    warn: (message) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.yellow(' [WARN] ') +
            chalk.white(message)
        );
    },

    error: (message) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.red(' [ERROR] ') +
            chalk.white(message)
        );
    },

    debug: (message) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.magenta(' [DEBUG] ') +
            chalk.white(message)
        );
    },

    command: (user, command, guild) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.hex('#FF6B6B')(' [CMD] ') +
            chalk.white(`${user} used `) +
            chalk.yellow(`/${command}`) +
            chalk.white(` in `) +
            chalk.green(guild)
        );
    },

    event: (eventName) => {
        console.log(
            chalk.blue(`[${getTimestamp()}]`) +
            chalk.hex('#9B59B6')(' [EVENT] ') +
            chalk.white(eventName)
        );
    },

    startup: () => {
        console.log(chalk.cyan(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         🤖 ULTIMATE DISCORD BOT v2.0.0          ║
║         Built with Discord.js v14                ║
║         Running 24/7 Premium Edition             ║
║                                                  ║
╚══════════════════════════════════════════════════╝
        `));
    },
};

module.exports = logger;