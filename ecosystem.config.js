module.exports = {
    apps: [
        {
            name: 'ultimate-discord-bot',
            script: 'index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
            },
            error_file: './logs/error.log',
            out_file: './logs/output.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            restart_delay: 5000,
            max_restarts: 10,
        },
    ],
};