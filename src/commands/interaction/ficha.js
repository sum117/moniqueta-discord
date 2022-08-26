import {channelMention, userMention} from '@discordjs/builders';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

import {db} from '../../db.js';
import {assets, PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {categories, channels, title} from '../../util';
const {sum} = assets;
const sheet = new Map();
export const data = {
  event: 'interactionCreate',
  name: 'Comando de Ficha de Personagem',
  description:
    'Gera uma ficha de personagem para a avaliação pelos administradores ao preencher o formulário no canal de fichas.'
};
/**
 * @param {ModalSubmitInteraction | SelectMenuInteraction} interaction A interação que iniciou o comando.
 */
export async function execute(interaction) {
  const {user, values, customId, component, channelId} = interaction;
  if (![channels.rpRegistro, channels.adminFichaRegistro].includes(channelId)) return;

  switch (interaction.type) {
    case InteractionType.MessageComponent:
      switch (channelId) {
        case channels.rpRegistro:
          if (!interaction.customId.match(/soma|genero|purgatorio|item_inicial/)) return;
          if (!sheet.get(user.id)) {
            const newChoices = new Map([[customId, customId !== 'item_inicial' ? values[0] : values]]);
            sheet.set(user.id, newChoices);
            return handleChoice();
          } else {
            /**
             * @type {Map}
             */
            const existingChoices = sheet.get(user.id);
            existingChoices.set(customId, customId !== 'item_inicial' ? values[0] : values);
            sheet.set(user.id, existingChoices);
            const conditions = {
              notReaper:
                existingChoices.get('item_inicial')?.includes('24') &&
                existingChoices.get('purgatorio') !== 'ceifador' &&
                existingChoices.size === 4,
              notScythe:
                !existingChoices.get('item_inicial')?.includes('24') &&
                existingChoices.get('purgatorio') === 'ceifador' &&
                existingChoices.size === 4
            };
            if (conditions.notScythe) {
              existingChoices.clear();
              return interaction.reply({
                content: '❌ Você não pode escolher o Ceifador de Imprévia se não escolher a Foice de Ceifador.',
                ephemeral: true
              });
            }
            if (conditions.notReaper) {
              existingChoices.clear();
              return interaction.reply({
                ephemeral: true,
                content: '❌ Você não pode escolher a Foice de Ceifador se não escolher o Ceifador de Imprévia.'
              });
            }

            if (existingChoices.size === 4) {
              return interaction.showModal(
                createForm([
                  [
                    true,
                    'persoNome',
                    'Nome do Personagem',
                    TextInputStyle.Short,
                    'Não utilize títulos aqui. Ex: "O Cavaleiro da Morte"',
                    128
                  ],
                  [true, 'persoPersonalidade', 'Personalidade', TextInputStyle.Paragraph, 'Seja Interessante...', 4000],
                  [
                    true,
                    'persoFisico',
                    'Características Físicas',
                    TextInputStyle.Paragraph,
                    'Peso, aparência geral, altura e etc...',
                    4000
                  ],
                  [
                    true,
                    'persoHabilidade',
                    'Habilidade',
                    TextInputStyle.Paragraph,
                    'A habilidade do personagem não irá interferir no combate.',
                    4000
                  ],
                  [
                    true,
                    'persoImagem',
                    'Link de Imagem',
                    TextInputStyle.Paragraph,
                    'https://i.imgur.com/image.png',
                    500
                  ]
                ])
              );
            }
            return handleChoice();
          }
          function handleChoice() {
            const optionLabel = `${title(
              component.options.find(option => option.value === values[0]).label
            )},${component.options
              .filter(option => values.includes(option.value))
              .map(option => option.label)
              .slice(1)
              .map(str =>
                str
                  .split('-')
                  .map(value => title(value))
                  .join(' ')
              )
              .join(', ')}`;
            return interaction.reply({
              content: 'Selecionei ' + optionLabel + ' continue!',
              ephemeral: true
            });
          }
        case channels.adminFichaRegistro:
          const match = interaction.customId.match(/aprovar|contato|rejeitar/);
          if (!match) return;
          const [action] = match;
          const trialUser = await interaction.guild.members.fetch(
            interaction.message.content.match(/(?<user>\d{17,19})/).groups.user
          );

          switch (action) {
            case 'aprovar':
              const approvedChar = await db.get(`${interaction.guildId}.pending.${trialUser.id}`);
              await new PlayCardBase().create(interaction, channels.rpFichas, approvedChar);
              /**
               * @type {Message}
               */
              const populacao = await updatePopulation(interaction);
              populacao.msg.edit({
                content:
                  'POPULAÇÃO DE IMPREVIA (JOGADORES):\n\n' +
                  Object.entries(populacao.populacao)
                    .map(([soma, quantia]) => {
                      return `${assets.sum[soma]?.emoji} ${title(soma)}: ${quantia}`;
                    })
                    .join('\n')
              });
              await trialUser.send({
                content: '✅ Sua ficha foi aprovada!',
                embeds: interaction.message.embeds
              });
              interaction.message.delete();
              sheet.delete(trialUser.id);
              db.delete(`${interaction.guildId}.pending.${trialUser.id}`);
              break;
            case 'rejeitar':
              await db.delete(`${interaction.guildId}.pending.${trialUser.id}`);
              await interaction.message.delete();
              sheet.delete(trialUser.id);
              await trialUser.send({
                content: '❌ Sua última ficha foi rejeitada.',
                embeds: interaction.message.embeds
              });
              break;
            case 'contato':
              const ticket = await interaction.guild.channels.create(`disputa-${trialUser.user.username}`, {
                type: 'text',
                parent: categories.arquivo,
                topic: 'Disputa de Ficha de Personagem',
                permissionOverwrites: [
                  {
                    id: trialUser.user.id,
                    allow: ['sendMessages', 'viewChannel']
                  },
                  {
                    id: interaction.guild.roles.everyone.id,
                    deny: ['viewChannel']
                  }
                ]
              });
              await ticket.send({
                content: `📩 Atenção, ${userMention(
                  trialUser.id
                )}, uma disputa para a sua última ficha foi aberta por ${userMention(user.id)}!`
              });
              const contactButton = new ButtonBuilder(interaction.component).setDisabled(true);
              interaction.message.edit({
                components: (() => {
                  return [interaction.message.components[0].spliceComponents(-2, 1, contactButton)];
                })()
              });
              await interaction.reply(
                `📩 Disputa aberta para ${trialUser.user.username} no canal ${channelMention(ticket.id)}`
              );
              break;
          }
      }
      break;
    case InteractionType.ModalSubmit:
      if (customId === 'ficha') {
        await interaction.reply({
          ephemeral: true,
          content:
            '✅ Ficha enviada com sucesso! Por favor, aguarde sua aprovação. Você será notificado caso haja algum problema. Com suas DMs abertas, seu chat comigo receberá uma cópia do os administradores estão vendo.'
        });
      }
      const choices = sheet.get(user.id);
      const canalDeAdmin = interaction.guild.channels.cache.get(channels.adminFichaRegistro);
      const userInput = ((inputs = [['']]) => {
        const map = new Map();
        inputs.forEach(([mapKey, fieldCustomId]) =>
          map.set(mapKey, interaction.fields.getTextInputValue(fieldCustomId))
        );
        return map;
      })([
        ['nome', 'persoNome'],
        ['personalidade', 'persoPersonalidade'],
        ['fisico', 'persoFisico'],
        ['habilidade', 'persoHabilidade'],
        ['imagem', 'persoImagem']
      ]);
      if (!choices)
        return interaction.channel.send({
          content:
            userMention(interaction.user.id) +
            ', o bot foi reiniciado recentemente e seu progresso foi apagado. Recomendamos não fazer fichas durante a manhã 06:00-12:00 e a noite 21:00-00:00 para evitar isso.'
        });
      sheet.set(user.id, new Map([...choices, ...userInput]));
      const embedArray = (() => {
        const array = [
          new EmbedBuilder()
            .setAuthor({
              name: user.username,
              iconURL: user.avatarURL({
                dynamic: true,
                size: 512
              })
            })
            .setTitle(userInput.get('nome'))
            .setThumbnail(userInput.get('imagem'))
            .setColor(choices.get('purgatorio') === 'ceifador' ? 5592405 : sum[choices.get('soma')].color)
            .addFields(
              {
                name: 'Soma',
                value:
                  sum[choices.get('soma')].emoji +
                  ' ' +
                  title(
                    choices.get('purgatorio') === 'ceifador'
                      ? 'Antigo ' + choices.get('soma').charAt(0).toUpperCase() + choices.get('soma').slice(1)
                      : choices.get('soma')
                  ),
                inline: true
              },
              {
                name: 'Genero',
                value:
                  choices.get('genero') === 'masculino'
                    ? '♂️ Masculino'
                    : choices.get('genero') === 'feminino'
                    ? '♀️ Feminino'
                    : '👽 Descubra',
                inline: true
              },
              {
                name: 'Fantasma',
                value: assets.phantom[choices.get('purgatorio')] + ' ' + title(choices.get('purgatorio')),
                inline: true
              }
            )
        ];
        userInput.delete('nome');
        userInput.forEach((value, key) => {
          const embed = new EmbedBuilder()
            .setTitle(title(key))
            .setColor(choices.get('purgatorio') === 'ceifador' ? 5592405 : sum[choices.get('soma')].color)
            .setDescription(value);
          if (key === 'imagem') embed.setImage(value).setTitle('').setDescription('');
          const check = str => `${str.length > 1497 ? str.slice(0, 1497) + '...' : str}`;
          embed.description = check(embed.description);
          array.push(embed);
        });
        return array;
      })();
      const components = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('aprovar').setLabel('Aprovado').setEmoji('✅').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('contato').setLabel('Disputar').setEmoji('💬').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('rejeitar').setLabel('Rejeitado').setEmoji('❌').setStyle(ButtonStyle.Danger)
      );
      canalDeAdmin.send({
        content: `Ficha de ${user}`,
        embeds: embedArray,
        components: [components]
      });
      const char = sheet.get(user.id);
      const serverItems = db.table('server_items');
      const itens = char.get('item_inicial');
      const mochila = {};
      await itens.forEach(async item => {
        const obj = await serverItems.get(item);
        obj.quantia = 1;
        delete obj.valor;
        mochila[item] = obj;
      });

      await db.set(`${interaction.guild.id}.pending.${user.id}`, {
        name: char.get('nome'),
        personality: char.get('personalidade'),
        appearance: char.get('fisico'),
        avatar: char.get('imagem'),
        gender: char.get('genero'),
        phantom: char.get('purgatorio'),
        sum: char.get('soma'),
        mochila: mochila
      });
      break;
  }
}

async function updatePopulation(interaction) {
  const sheetCounterMsg = await interaction.guild.channels.cache
    .get('977090435845603379')
    .messages.fetch('995391433425043598');
  const populacao = {};
  const jogadores = (await db.all())
    .filter(({id}) => {
      return !id.match(/\D+/) && interaction.guildId !== id;
    })
    .map(({value}) => {
      return value.chars;
    });
  let somas = jogadores
    .filter(({value}) => value !== null)
    .map(jogador => {
      let inner = Object.values(jogador)
        .filter(char => char !== null || !char?.dead)
        .map(char => {
          if (char?.sum) return char.sum;
          return;
        });
      if (inner.length >= 1) return inner.reduce(a => a);
      return inner;
    });
  somas.forEach(aliveSum => {
    if (aliveSum === undefined) return;
    populacao[aliveSum] = populacao[aliveSum] ? populacao[aliveSum] + 1 : 1;
  });

  return {msg: sheetCounterMsg, populacao: populacao};
}

/**
 *
 * @typedef {[required: boolean, customId: string, label: string, style: string, placeholder: string, maxLength: number]} FormOptions
 */
/**
 *
 * @param {Array<FormOptions>} options - Uma array do tipo {@link FormOptions} contendo os campos a serem exibidos no formulário.
 * @return {ModalBuilder} `ModalBuilder` Um objeto do tipo {@link ModalBuilder} que representa o formulário.
 */
export function createForm(options) {
  const form = new ModalBuilder().setCustomId('ficha').setTitle('Ficha de Personagem');
  const array = options.map(option => {
    const [required = true, customId = '', label = '', style = '', placeholder = '', maxLength = 128] = option;
    return new TextInputBuilder()
      .setRequired(required)
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(style)
      .setPlaceholder(placeholder)
      .setMaxLength(maxLength);
  });
  const rows = array.map(field => new ActionRowBuilder().addComponents(field));
  form.addComponents(rows);
  return form;
}
