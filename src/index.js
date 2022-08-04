import {Client, Collection, Message, MessageSelectMenu} from 'discord.js';
import {channelMention} from '@discordjs/builders';
import {Player} from 'discord-player';
import {loadEvents, registerSlashCommands, updateMemberCounter, channels, token, myGuild, prefix} from './util';
// Since we're using the ready event in index, I imported prefix and slash commands here to setup the .commands collection for the bot, which is used in the help command.
import * as prefixCommands from './commands/prefix';
import * as slashCommands from './commands/slash';
import * as musicCommands from './commands/music';
import {db} from './db.js';
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

  moniqueta.guilds.fetch(myGuild).then(guild =>
    guild.invites.fetch().then(invites => {
      console.log('Novos convites foram salvos.');
      invites.each(invite => moniqueta.inviteCodeUses.set(invite.code, invite.uses));
      moniqueta.guildInvites.set(myGuild, moniqueta.inviteCodeUses);
      console.log(moniqueta.guildInvites);
    })
  );
  for (const commands of [slashCommands, prefixCommands, musicCommands]) {
    Object.entries(commands).forEach(([key, command]) => {
      moniqueta.commands.set(key, [command.data.description, command.data?.type]);
    });
  }
  await changeComponentOptions(
    '977090435845603379',
    '1004464543629578250',
    3,
    'item_inicial',
    'Escolha um Item Inicial',
    [
      {
        label: 'Lâminas Gêmeas',
        value: '6',
        description: 'Uma arma com duas lâminas perfeitamente similares.',
        emoji: '👀'
      },
      {
        label: 'Grimório de Moonadom',
        value: '15',
        description: 'Um grimório feito à partir de sangue.',
        emoji: '📕'
      },
      {
        label: 'Tridente Quimera',
        value: '7',
        description: 'Uma arma forjada reutilizando partes de outras armas.',
        emoji: '🔱'
      },
      {
        label: 'Katana de Kojirou',
        value: '8',
        description: 'A arma mais leal existente no continente de Imprevia.',
        emoji: '🗡️'
      },
      {
        label: 'Grande Lâmina',
        value: '9',
        description: 'Um campeão que domina tal montante, consegue destruir qualquer coisa.',
        emoji: '💀'
      }
    ]
  );
  moniqueta.channels.cache.forEach(async channel => {
    /**@type {Message} */
    const msg = channel.type === 'GUILD_TEXT' ? (await channel.messages.fetch()).first() : null;
    if (msg && msg.author.username.match(/Deleted/))
      return moniqueta.channels.cache
        .get('976880373118148679')
        .send('Canal com antiga mensagem do SDA: ' + channelMention(msg.channelId));
  });
});

process.on('unhandledRejection', e => {
  console.log(e);
  moniqueta.channels.cache.get(channels.errorChannel).send({
    content: `⚠️ Meu Deus, meu senhor, me ajuda, por favor.\n**Nome:**${e.name}\n**Stack:**${e.stack}`
  });
});

moniqueta.login(token);

/**
 *
 * @param {string} channelId O id do canal
 * @param {string} messageId O id da mensagem
 * @param {number} actionRow A posição da linha que deve ser editada
 * @param {string} customId O id do novo componente da actionRow
 * @param {string} placeHolder O novo placeholder do componente
 * @param {Array<object>} options As novas opções do componente
 * @returns {Promise<Message>} A mensagem editada
 */
async function changeComponentOptions(
  channelId = '',
  messageId = '',
  actionRow = 0,
  customId = '',
  placeHolder = '',
  options = [{}]
) {
  /**
   * @type {Message}
   */
  const message = await moniqueta.channels.cache.get(channelId).messages.fetch(messageId);
  const component = message.components[actionRow].setComponents(
    new MessageSelectMenu()
      .setCustomId(customId)
      .setMaxValues(2)
      .setMinValues(2)
      .setPlaceholder(placeHolder)
      .addOptions(options)
  );
  return message.edit({
    content: message.content,
    components: [...message.components.slice(-4, 3), component]
  });
}
