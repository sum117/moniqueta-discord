import {Client, Collection, Message, MessageSelectMenu} from 'discord.js';
import {channelMention} from '@discordjs/builders';
import {Player} from 'discord-player';
import {loadEvents, registerSlashCommands, updateMemberCounter, channels, token, myGuild, prefix, roles} from './util';
// Since we're using the ready event in index, I imported prefix and slash commands here to setup the .commands collection for the bot, which is used in the help command.
import * as prefixCommands from './commands/prefix';
import * as slashCommands from './commands/slash';
import * as musicCommands from './commands/music';

export const moniqueta = new Client({
  intents: 32767
});
export const player = new Player(moniqueta);
moniqueta.commands = new Collection();
moniqueta.memberCounter = new Collection();
moniqueta.inviteCodeUses = new Collection();
moniqueta.guildInvites = new Collection();
moniqueta.prefix = await prefix;
moniqueta.on('ready', async () => {
  console.log('Moniqueta pronta.');

  registerSlashCommands(moniqueta, myGuild);
  const musicPlayerEvents = new Map([
    [
      'error',
      (queue, error) => {
        new Error(`${queue.guild.name} Erro emitido da lista: ${error.message}`);
      }
    ],
    [
      'connectionError',
      (queue, error) => {
        new Error(`[${queue.guild.name}] Erro emitido da conexão: ${error.message}`);
      }
    ],
    [
      'trackStart',
      (queue, track) => {
        new Error(`[${queue.guild.name}] Começou a tocar: ${track.title}`);
      }
    ],
    [
      'trackAdd',
      (queue, track) => {
        queue.metadata.send(`🎶 Adicionei **${track.title}** para a fila!`);
      }
    ],
    [
      'botDisconnect',
      queue => {
        queue.metadata.send('😡 Eu fui desconectada do canal de voz... vou deletar a lista de todo mundo!');
      }
    ],
    [
      'channelEmpty',
      queue => {
        queue.metadata.send('💔 Vocês me deixaram sozinha... vou embora.');
      }
    ],
    [
      'queueEnd',
      queue => {
        queue.metadata.send('✅ Terminei de tocar tudo! O que vamos fazer agora?');
      }
    ]
  ]);
  loadEvents(
    [moniqueta, player],
    [
      {once: 'true', name: 'ready'},
      {name: 'messageCreate'},
      {name: 'interactionCreate'},
      {name: 'guildMemberAdd'},
      {name: 'guildMemberRemove'},
      {name: 'inviteCreate'}
    ],
    musicPlayerEvents
  );
  updateMemberCounter(moniqueta, myGuild);
  // Salvando invites
  moniqueta.guilds.fetch(myGuild).then(guild =>
    guild.invites.fetch().then(invites => {
      console.log('Novos convites foram salvos.');
      invites.each(invite => moniqueta.inviteCodeUses.set(invite.code, invite.uses));
      moniqueta.guildInvites.set(myGuild, moniqueta.inviteCodeUses);
      console.log(moniqueta.guildInvites);
    })
  );
  // Registrando comandos
  for (const commands of [slashCommands, prefixCommands, musicCommands]) {
    Object.entries(commands).forEach(([key, command]) => {
      moniqueta.commands.set(key, [command.data.description, command.data?.type]);
    });
  }
  setInterval(async () => {
    const members = await moniqueta.guilds.cache.first().members.fetch();
    members.forEach(async member => {
      if (
        member.user.username.startsWith('SDA •') ||
        member.presence?.activities[0]?.state?.match(/https\:\/\/discord\.sumserver\.xyz/)
      ) {
        await member.roles.add(roles.xpBoostRole);
      } else {
        if (member.roles.cache.get(roles.xpBoostRole)) await member.roles.remove(roles.xpBoostRole);
      }
    });
  }, 5 * 60 * 1000);
});

process.on('unhandledRejection', e => {
  console.log(e);
  moniqueta.channels.cache.get(channels.errorChannel).send({
    content: `⚠️ Meu Deus, meu senhor, me ajuda, por favor.\n**Nome:**${e.name}\n**Stack:**${e.stack}`
  });
});

moniqueta.login(token);
