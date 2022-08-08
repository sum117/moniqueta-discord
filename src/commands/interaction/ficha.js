import {channelMention, userMention} from '@discordjs/builders';
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent
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
    case 'MESSAGE_COMPONENT':
      switch (channelId) {
        case channels.rpRegistro:
          if (!interaction.customId.match(/soma|genero|purgatorio|item_inicial/)) return;
          if (!sheet.get(user.id)) {
            const choices = new Map([[customId, customId !== 'item_inicial' ? values[0] : values]]);
            sheet.set(user.id, choices);
            return handleChoice();
          } else {
            const choices = sheet.get(user.id);
            choices.set(customId, customId !== 'item_inicial' ? values[0] : values);
            sheet.set(user.id, choices);
            if (choices.size === 4) {
              return interaction.showModal(
                createForm([
                  [
                    ,
                    'persoNome',
                    'Nome do Personagem',
                    'SHORT',
                    'Não utilize títulos aqui. Ex: "O Cavaleiro da Morte"',
                    128
                  ],
                  [, 'persoPersonalidade', 'Personalidade', 'PARAGRAPH', 'Seja Interessante...', 4000],
                  [
                    ,
                    'persoFisico',
                    'Características Físicas',
                    'PARAGRAPH',
                    'Peso, aparência geral, altura e etc...',
                    4000
                  ],
                  [
                    ,
                    'persoHabilidade',
                    'Habilidade',
                    'PARAGRAPH',
                    'A habilidade do personagem não irá interferir no combate.',
                    4000
                  ],
                  [, 'persoImagem', 'Link de Imagem', 'SHORT', 'https://i.imgur.com/image.png', 500]
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
              .map(value =>
                value
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
              const char = await db.get(`${interaction.guildId}.pending.${trialUser.id}`);
              await new PlayCardBase().create(interaction, channels.rpFichas, char);
              /**
               * @type {Message}
               */
              const populacao = await updatePopulation(interaction);
              populacao.msg.edit({
                content:
                  'POPULAÇÃO DE IMPREVIA (JOGADORES):\n\n' +
                  Object.entries(populacao.populacao)
                    .map(([soma, quantia]) => {
                      return `${assets.sum[soma].emoji} ${title(soma)}: ${quantia}`;
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
              trialUser.send({
                content: '❌ Sua última ficha foi rejeitada.',
                embeds: interaction.message.embeds
              });
              interaction.message.delete();
              sheet.delete(trialUser.id);
              db.delete(`${interaction.guildId}.pending.${trialUser.id}`);
              break;
            case 'contato':
              const ticket = await interaction.guild.channels.create(`disputa-${trialUser.user.username}`, {
                type: 'text',
                parent: categories.arquivo,
                topic: 'Disputa de Ficha de Personagem',
                permissionOverwrites: [
                  {
                    id: trialUser.user.id,
                    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                  }
                ]
              });
              await ticket.send({
                content: `📩 Atenção, ${userMention(
                  trialUser.id
                )}, uma disputa para a sua última ficha foi aberta por ${userMention(user.id)}!`
              });
              const contactButton = new MessageButton(interaction.component).setDisabled(true);
              interaction.message.edit({
                components: (() => {
                  const array = [interaction.message.components[0].spliceComponents(-2, 1, contactButton)];
                  return array;
                })()
              });
              await interaction.reply(
                `📩 Disputa aberta para ${trialUser.user.username} no canal ${channelMention(ticket.id)}`
              );
              break;
          }
      }
      break;
    case 'MODAL_SUBMIT':
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
        inputs.map(([mapKey, fieldCustomId]) => map.set(mapKey, interaction.fields.getTextInputValue(fieldCustomId)));
        return map;
      })([
        ['nome', 'persoNome'],
        ['personalidade', 'persoPersonalidade'],
        ['fisico', 'persoFisico'],
        ['habilidade', 'persoHabilidade'],
        ['imagem', 'persoImagem']
      ]);
      if (!choices)
        return await interaction.channel.send({
          content:
            interaction.user +
            ', o bot foi reiniciado recentemente e seu progresso foi apagado. Recomendamos não fazer fichas durante a manhã 06:00-12:00 e a noite 21:00-00:00 para evitar isso.'
        });
      sheet.set(user.id, new Map([...choices, ...userInput]));
      const embedArray = (() => {
        const array = [
          new MessageEmbed()
            .setAuthor({
              name: user.username,
              iconURL: user.avatarURL({
                dynamic: true,
                size: 512
              })
            })
            .setTitle(userInput.get('nome'))
            .setThumbnail(userInput.get('imagem'))
            .setColor(sum[choices.get('soma')].color)
            .addField('Soma', sum[choices.get('soma')].emoji + ' ' + title(choices.get('soma')), true)
            .addField(
              'Genero',
              choices.get('genero') === 'masculino'
                ? '♂️ Masculino'
                : choices.get('genero') === 'feminino'
                ? '♀️ Feminino'
                : '👽 Descubra',
              true
            )
            .addField(
              'Fantasma',
              assets.phantom[choices.get('purgatorio')] + ' ' + title(choices.get('purgatorio')),
              true
            )
        ];
        userInput.delete('nome');
        userInput.forEach((value, key) => {
          const embed = new MessageEmbed()
            .setTitle(title(key))
            .setColor(sum[choices.get('soma')].color)
            .setDescription(value);
          if (key === 'imagem') embed.setImage(value).setTitle('').setDescription('');
          const check = str => `${str.length > 1497 ? str.slice(0, 1497) + '...' : str}`;
          embed.description = check(embed.description);
          array.push(embed);
        });
        return array;
      })();
      const components = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('aprovar').setLabel('Aprovado').setEmoji('✅').setStyle('SUCCESS'),
        new MessageButton().setCustomId('contato').setLabel('Disputar').setEmoji('💬').setStyle('SECONDARY'),
        new MessageButton().setCustomId('rejeitar').setLabel('Rejeitado').setEmoji('❌').setStyle('DANGER')
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

  const somas = jogadores.map(jogador =>
    Object.values(jogador)
      .filter(char => !char.dead)
      .map(char => char.sum)
      .reduce(a => a)
  );
  somas.forEach(sum => {
    populacao[sum] = populacao[sum] ? populacao[sum] + 1 : 1;
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
 * @return {Modal} `Modal` Um objeto do tipo {@link Modal} que representa o formulário.
 */
export function createForm(options) {
  const form = new Modal().setCustomId('ficha').setTitle('Ficha de Personagem');
  const array = options.map(option => {
    const [required = true, customId = '', label = '', style = '', placeholder = '', maxLength = 128] = option;
    return new TextInputComponent()
      .setRequired(required)
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(style)
      .setPlaceholder(placeholder)
      .setMaxLength(maxLength);
  });
  const rows = array.map(field => new MessageActionRow().addComponents(field));
  form.addComponents(rows);
  return form;
}
