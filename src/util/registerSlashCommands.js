import * as slashCommands from "../commands/slash"
export async function registerSlashCommands(client, guildId) {
    const slashCommandsArray = Object.entries(slashCommands).map(([, value]) => {
        return value.data.toJSON()
    })
    await client.application.commands.set(slashCommandsArray, guildId);
}
