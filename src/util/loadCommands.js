import {prefix} from './misc.js';
import {GuildMember} from 'discord.js';
import * as slashCommands from '../commands/slash';
import * as interactionCommands from '../commands/interaction';
import * as prefixCommands from '../commands/prefix';
import * as commandSystems from '../commands/systems';
import * as musicCommands from '../commands/music';
const music = Object(musicCommands);

const slash = Object(slashCommands);
const interactions = Object(interactionCommands);
const prefixed = Object(prefixCommands);
const systems = Object(commandSystems);

export async function loadCommands(event, [moniqueta, musicPlayer], ...args) {
  switch (event) {
    case 'messageCreate':
      const msg = args[0];
      if (msg.content.startsWith(prefix)) {
        const userArgs = msg.content.slice(1).trim().split(/ +/);
        const name = userArgs[0].toLowerCase();
        const command = prefixed[name];
        userArgs.shift();
        if (command) {
          await command.execute(msg, userArgs);
        } else msg.reply('❌ Não encontrei o comando que você tentou executar.');
      }
      break;
    case 'interactionCreate':
      const interaction = args[0];
      if (interaction.isCommand()) {
        if (slash[interaction.commandName]) await slash[interaction.commandName].execute(interaction, moniqueta);
        else if (music[interaction.commandName]) {
          if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
            return void interaction.reply({
              content: '😡 Ei! Você não tá num canal de música, tá tentando me bugar?!',
              ephemeral: true
            });
          }
          if (
            interaction.guild.me.voice.channelId &&
            interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
          ) {
            return void interaction.reply({
              content:
                '😡 Eu sei que você quer ficar sozinho, mas se sou eu que vou tocar pra você, vai ter que ficar no mesmo canal que eu!',
              ephemeral: true
            });
          }
          await music[interaction.commandName].execute(interaction, musicPlayer);
        }
      } else {
        for (const command in interactions) {
          if (interactions[command].data.event === event) await interactions[command].execute(interaction, moniqueta);
        }
      }
      break;
    default:
      for (const [, system] of Object.entries(systems)) {
        if (system.data.events.includes(event)) await system.execute(event, moniqueta, ...args);
      }
  }
}
