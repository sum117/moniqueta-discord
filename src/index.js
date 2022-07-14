import { Client, Collection } from 'discord.js';
import {
  loadEvents,
  registerSlashCommands,
  updateMemberCounter,
  myGuild,
  token
} from './util.js';

export const moniqueta = new Client({
  intents: 32767,
});
moniqueta.commands = new Collection();
moniqueta.memberCounter = new Map();
moniqueta.inviteCodeUses = new Map();
moniqueta.guildInvites = new Map();

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
});

moniqueta.login(token);
