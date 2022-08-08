import * as slashCommands from '../commands/slash';
import * as musicCommands from '../commands/music';

export async function registerSlashCommands(client, guildId) {
  const slashCommandsArray = Object.entries(slashCommands).map(([, value]) => {
    return value.data.toJSON();
  });
  const musicCommandsObj = {
    name: 'musica',
    description: 'interage com todos os comandos de musica',
    options: Object.entries(musicCommands).map(([, value]) => {
      value.data.type = 1;
      return value.data;
    })
  };
  slashCommandsArray.push(musicCommandsObj);
  await client.application.commands.set(slashCommandsArray, guildId);
}
