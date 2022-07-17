import * as slashCommands from '../commands/slash';
import * as musicCommands from '../commands/music';

export async function registerSlashCommands(client, guildId) {
  const slashCommandsArray = Object.entries(slashCommands).map(([, value]) => {
    return value.data.toJSON();
  });
  slashCommandsArray.push(...Object.entries(musicCommands).map(([, value]) => value.data));
  await client.application.commands.set(slashCommandsArray, guildId);
}
