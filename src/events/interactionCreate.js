module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {

        // Handle buttons
        if (interaction.isButton()) {
            if (interaction.customId === 'help_delete') {
                interaction.message.delete().catch(function() {});
            }
            return;
        }

        // Handle select menus
        if (interaction.isStringSelectMenu()) {
            return;
        }

        // Handle modals
        if (interaction.isModalSubmit()) {
            return;
        }

        // Handle autocomplete
        if (interaction.isAutocomplete()) {
            var autoCmd = client.commands.get(interaction.commandName);
            if (autoCmd && autoCmd.autocomplete) {
                try {
                    await autoCmd.autocomplete(interaction, client);
                } catch (err) {
                    console.log('Autocomplete error: ' + err.message);
                }
            }
            return;
        }

        // Handle slash commands only
        if (!interaction.isChatInputCommand()) return;

        var command = client.commands.get(interaction.commandName);

        if (!command) {
            console.log('Unknown command: ' + interaction.commandName);
            return;
        }

        console.log('[CMD] ' + interaction.user.tag + ' used /' + interaction.commandName + ' in ' + (interaction.guild ? interaction.guild.name : 'DM'));

        try {
            // Owner check
            if (command.ownerOnly) {
                var ownerId = process.env.OWNER_ID || '';
                if (interaction.user.id !== ownerId) {
                    return interaction.reply({
                        content: '❌ This command is for bot owners only.',
                        ephemeral: true
                    });
                }
            }

            // Permission check
            if (command.userPermissions && interaction.guild) {
                var missing = [];
                for (var i = 0; i < command.userPermissions.length; i++) {
                    if (!interaction.member.permissions.has(command.userPermissions[i])) {
                        missing.push(command.userPermissions[i]);
                    }
                }
                if (missing.length > 0) {
                    return interaction.reply({
                        content: '❌ You don\'t have permission to use this command.',
                        ephemeral: true
                    });
                }
            }

            // Cooldown check
            if (command.cooldown) {
                if (!client.cooldowns.has(command.data.name)) {
                    client.cooldowns.set(command.data.name, new Map());
                }

                var now = Date.now();
                var timestamps = client.cooldowns.get(command.data.name);
                var cooldownMs = (command.cooldown || 3) * 1000;

                if (timestamps.has(interaction.user.id)) {
                    var expireTime = timestamps.get(interaction.user.id) + cooldownMs;
                    if (now < expireTime) {
                        var left = ((expireTime - now) / 1000).toFixed(1);
                        return interaction.reply({
                            content: '⏳ Wait ' + left + 's before using this again.',
                            ephemeral: true
                        });
                    }
                }

                timestamps.set(interaction.user.id, now);
                setTimeout(function() {
                    timestamps.delete(interaction.user.id);
                }, cooldownMs);
            }

            // Run the command
            await command.execute(interaction, client);

        } catch (error) {
            console.log('[ERROR] /' + interaction.commandName + ': ' + error.message);
            console.error(error);

            var errorMsg = {
                content: '❌ Something went wrong with this command.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                interaction.followUp(errorMsg).catch(function() {});
            } else {
                interaction.reply(errorMsg).catch(function() {});
            }
        }
    }
};