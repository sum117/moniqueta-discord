import {Client, Collection, Message, MessageSelectMenu} from 'discord.js';
import {channelMention} from '@discordjs/builders';
import {Player} from 'discord-player';
import {loadEvents, registerSlashCommands, updateMemberCounter, channels, token, myGuild, prefix, roles} from './util';
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
moniqueta.postCounter = new Collection();
moniqueta.inviteCodeUses = new Collection();
moniqueta.guildInvites = new Collection();
moniqueta.prefix = await prefix;
moniqueta.on('ready', async () => {
  console.log('Moniqueta pronta.');
  (await db.all())
    .filter(value => value.value.isEditting)
    .map(async value => {
      await db.set(`${value.id}.isEditting`, false);
    });
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
      moniqueta.commands.set(key, [command.data.description, command.data?.kind]);
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
  await changeComponentOptions(
    '977090435845603379',
    '995391321713938432',
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
        value: '14',
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
      },
      {
        label: 'Faca Velha',
        value: '12',
        description: 'Uma faca de cozinha qualquer.',
        emoji: '🔪'
      },

      {
        label: 'Espada Quebrada',
        value: '10',
        description: 'O que antes provavelmente era uma nobre e gigante arma, agora já não é mais.',
        emoji: '💥'
      },

      {
        label: 'Messer',
        value: '11',
        description: 'Camponeses transformaram suas ferramentas do dia-a-dia em armas de auto-defesa, essa é a Messer.',
        emoji: '🌾'
      },

      {
        label: 'Cetro Meio-Reluzente',
        value: '13',
        description: 'Um grande cetro feito a partir de metais recliclados e uma boa porção de energia somática.',
        emoji: '✨'
      },

      {
        label: 'Machadinha',
        value: '18',
        description: 'Uma ferramenta usada para partir toras de lenha antes do inverno.',
        emoji: '🪓'
      },
      {
        label: 'Varinha de Iniciante',
        value: '15',
        description: 'Longe de um prestigioso cetro ou um grimório antigo, mas capaz de proteger novatos decentemente.',
        emoji: '🌀'
      },
      {
        label: 'Arco Simples',
        value: '16',
        description: 'Construído por caçadores que se aventuram em meio as florestas do Equador.',
        emoji: '🏹'
      },
      {
        label: 'Marreta de Guerra',
        value: '17',
        description: 'Uma arma encontrada em campos de batalhas sangrentos...',
        emoji: '🔨'
      },
      {
        label: 'Violão Sideriano',
        value: '19',
        description: 'A cada corda que se toca sente-se um calafrio...',
        emoji: '🎸'
      },
      {
        label: 'Harpa de Darandur',
        value: '23',
        description: 'Uma réplica de uma harpa muito, muito importante.',
        emoji: '<:Harpa:1006667192034656256>'
      },
      {
        label: 'Foice de Ceifador',
        value: '24',
        description: 'Uma foice que parece ser capaz de cortar através da morte.',
        emoji: '<:foice:1007375203870974053>'
      }
    ]
  );

  /**
   * @type {Message}
   */
  let msg = await moniqueta.channels.cache.get('977090435845603379').messages.fetch('995391321713938432');
  let selector = msg.components[2].components[0];
  selector.addOptions({
    label: 'Ceifador de Imprévia',
    value: 'ceifador',
    description: 'Uma entidade que se absteu de ter soma para um bem maior.',
    emoji: '<:ceifador:1007356733812903986>'
  });
  msg.edit({components: msg.components});
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
});

process.on('unhandledRejection', e => {
  console.log(e);
  moniqueta.channels.cache.get(channels.errorChannel).send({
    content: `⚠️ Meu Deus, meu senhor, me ajuda, por favor.\n**Nome:**${e.name}\n**Stack:**${e.stack}`
  });
});

moniqueta.login(token);
