import { Client, Collection } from 'discord.js';
import {
  loadEvents,
  registerSlashCommands,
  updateMemberCounter,
  myGuild,
  token,
  channels
} from './util.js';

export const moniqueta = new Client({
  intents: 32767,
});
moniqueta.commands = new Collection();
moniqueta.memberCounter = new Collection();
moniqueta.inviteCodeUses = new Collection();
moniqueta.guildInvites = new Collection();

moniqueta.once('ready', async () => {
  console.log('Moniqueta pronta.');

  registerSlashCommands(moniqueta, myGuild);
  loadEvents(moniqueta, [
    { once: true, name: 'ready' },
    { name: 'messageCreate' },
    { name: 'interactionCreate' },
    { name: 'guildMemberAdd' },
    { name: 'guildMemberRemove' },
    { name: 'inviteCreate' },
  ]);
  updateMemberCounter(myGuild);
});

process.on('unhandledRejection', (e) => {
  console.log(e);
  moniqueta.channels.cache.get(channels.errorChannel).send({
    content: `⚠️ Meu Deus, meu senhor, me ajuda, por favor.\n**Nome:**${e.name}\nStack:${e.stack}`
  })
});

moniqueta.login(token);
