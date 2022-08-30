import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
  SelectMenuOptionBuilder
} from 'discord.js';

import {db} from '../../db.js';
import {embedComponent, title} from '../../util';
import {Combat} from './Combat.js';
import {assets} from './PlayCardBase.js';

export class Item extends Combat {
  constructor() {
    super();
  }

  static async create(item = {}) {
    const {slot, nome, desc, base, tipo, multiplicador = {num: 0, tipo: ''}, valor} = item;
    const serverItems = db.table('server_items');

    const id =
      +(await serverItems.all())
        .map(object => object.id)
        .sort((a, b) => a - b)
        .pop() + 1;
    const itemObject = {slot, nome, desc, base, tipo, multiplicador, valor, equipado: false};
    await serverItems.set(`${id}`, itemObject);
    return await embedComponent(
      `✅ ${bold(nome)} criado com sucesso:\n\n${Object.entries(itemObject)
        .filter(([key]) => key !== 'equipado')
        .map(
          ([key, value]) =>
            `${bold(title(key))}: ${title(
              `${typeof value === 'object' ? `\n> ${value.num}\n> ${title(value.tipo)}` : value}`
            )}`
        )
        .join('\n')}`
    );
  }

  static async delete(id) {
    const serverItems = db.table('server_items');
    const item = await serverItems.get(id);
    if (!item) return '❌ Item não encontrado';
    await serverItems.delete(id);
    return await embedComponent(`✅ ${bold(item.nome)} deletado com sucesso`);
  }

  static async show(id) {
    const serverItems = db.table('server_items');
    const item = await serverItems.get(id);
    if (!item) return '❌ Item não encontrado';
    return await embedComponent(
      `✅ ${bold(item.nome)}:\n\n${Object.entries(item)
        .filter(([key]) => key !== 'equipado')
        .map(
          ([key, value]) =>
            `${bold(title(key))}: ${title(
              `${typeof value === 'object' ? `\n> ${value.num}\n> ${title(value.tipo)}` : value}`
            )}`
        )
        .join('\n')}`
    );
  }
  static async list() {
    await sortItems();
    const serverItems = db.table('server_items');
    const items = await serverItems.all();
    return await embedComponent(items.map(object => `ID ${bold(object.id)}: ${title(object.value.nome)}`).join('\n'));
  }
  static async give(id = '', givingMember, receivingUser, quantia = 1) {
    const serverItems = db.table('server_items');
    const serverItem = await serverItems.get(id);

    const givingUserItems = (await getInventory(givingMember.user)).mochila;
    const givingUserItem = (await givingUserItems?.[id]) ?? {};
    if (givingMember.permissions.has('manageGuild')) givingUserItem.quantia = 1;
    const {mochila: receivingUserItems, char: receivingUserChar} = await getInventory(receivingUser);
    const receivingUserItem = (await receivingUserItems?.[id]) ?? {};

    if (!serverItem) return await embedComponent('❌ Item não encontrado');

    if (givingUserItem?.quantia < 1) return await embedComponent(`❌ Você não tem ${serverItem.nome}`);
    if (givingUserItem?.quantia < quantia)
      return await embedComponent(`❌ Você não tem ${bold(quantia)} de ${bold(serverItem.nome)}`);

    givingUserItem.quantia = givingUserItem.quantia - quantia;
    await setInventory(givingMember.user, id, givingUserItem);
    await setInventory(receivingUser, id, {...serverItem, quantia: receivingUserItem.quantia + quantia});

    return await embedComponent(
      `✅ ${bold(serverItem.nome)} adicionado ao inventário de ${bold(receivingUserChar.name)}. Ele foi dado por ${bold(
        givingMember.user.username
      )}`
    );
  }
  /**
   *
   * @param {SelectMenuInteraction | ButtonInteraction} interaction O seletor ou botão que instanciou esta interação
   * @param {string} action A ação que o usuário escolheu
   * @param {User} user O usuário que instanciou o comando.
   * @returns Um painel de interação com o usuário para escolher os itens
   */
  static async equipPanel(interaction, action, user) {
    const charDb = await getInventory(user);
    const getEquipped = () =>
      [...Object.entries(charDb.char.equipamentos), ...Object.entries(charDb.char.armas)]
        .map(([key, item]) => `${assets.itens[key]} ${item.nome ? item.nome : ''} `)
        .join('\n');
    const getUnequipped = () =>
      Object.entries(charDb.mochila)
        .filter(([, item]) => !item.equipado)
        .map(([, item]) => `${item.nome} • ${item.quantia}`)
        .join('\n');
    const msgObj = () => {
      return {
        fetchReply: true,
        ephemeral: true,
        embeds: [
          {
            title: 'Inventário de ' + charDb.char.name,
            thumbnail: {url: charDb.char.avatar},
            color: assets.sum[charDb.char.sum].color,
            fields: [
              {
                name: '📌 Equipados',
                value: getEquipped()
                  ? getEquipped()
                  : 'Nenhum item equipado. Use os seletores para equipar um item em um slot.',
                inline: true
              },
              {
                name: '🎒 Não equipados:',
                value: getUnequipped() ? getUnequipped() : 'Nenhum item não equipado.',
                inline: true
              }
            ]
          }
        ],
        components: [
          new ActionRowBuilder().addComponents(generateButtons().splice(0, 5)),
          new ActionRowBuilder().addComponents(generateButtons().slice(5)),
          new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
              .setCustomId('equipar_item')
              .setPlaceholder('Aguardando seleção de slot...')
              .setOptions([new SelectMenuOptionBuilder().setLabel('nada').setValue('nada').setDescription('nada')])
              .setDisabled(true)
          )
        ]
      };
    };
    const staticEmbed = msgObj();
    switch (action) {
      case 'selecionar_slot':
        const selector = SelectMenuBuilder.from(interaction.message.components[2].components[0]);
        const options = () =>
          Object.entries(charDb.mochila)
            .filter(([, item]) => !item.equipado && interaction.customId.match(item.slot))
            .map(([id, item]) => {
              if (!item) return;
              return {
                label: title(item.nome),
                value: `${id}`,
                emoji: assets.itens[item.slot],
                description: `Quantia: ${item.quantia}`
              };
            });
        selector.setDisabled(false);
        const unequipOptions = () =>
          [...Object.entries(charDb.char.equipamentos), ...Object.entries(charDb.char.armas)]
            .filter(([key, item]) => item.equipado && interaction.customId === key)
            .map(([id, item]) => {
              if (!item) return;
              return {key: id, item: item};
            });
        let newOptions = [
          {
            label: `${unequipOptions().length >= 1 ? unequipOptions()[0].item.nome : 'Nada equipado'}`,
            value: `desequipar_${unequipOptions()[0]?.key ?? 'none'}_${unequipOptions()[0]?.item.id ?? 'none'}`,
            description: 'Desequipar item do slot selecionado',
            emoji: '❌'
          }
        ];
        if (options().length >= 1) newOptions.push(...options());
        else
          newOptions.push({
            label: 'Nada aqui',
            value: 'nenhum_item',
            description: 'Apenas nós e o galinheiro...',
            emoji: '🐓'
          });
        selector.setOptions(newOptions);
        selector.setPlaceholder(title(interaction.customId));
        staticEmbed.components.splice(2, 1, new ActionRowBuilder().addComponents(selector));
        return await interaction?.update({
          embeds: msgObj().embeds,
          components: staticEmbed.components
        });
      case 'equipar_item':
        const id = interaction.values[0];
        const item = charDb.mochila[interaction.values[0]];
        if (id === 'nenhum_item') return await interaction?.update({content: '🥚 Pó Pó!'});
        // Desequipar item
        if (id.startsWith('desequipar')) {
          const slot = id.split('_')[1];
          if (slot === 'none') return;
          const itemId = id.split('_')[2];
          const item = charDb.mochila[itemId];

          item.equipado = false;
          if (!slot.startsWith('arma')) {
            charDb.char.equipamentos[slot] = {};
            await setChar(user, 'equipamentos', charDb.char.equipamentos);
          } else {
            for (let arma in charDb.char.armas) {
              if (charDb.char.armas[arma].id === itemId) {
                charDb.char.armas[arma] = {};
              }
            }
            await setChar(user, 'armas', charDb.char.armas);
          }
          await setInventory(user, itemId, item);
          return interaction.update({
            content: '✅ Item desequipado com sucesso!',
            ephemeral: true,
            embeds: msgObj().embeds,
            components: staticEmbed.components
          });
        }
        // Msg de erro
        if (item.quantia < 1)
          return interaction.update({content: '❌ Você não tem nenhum desse item sobrando.', ephemeral: true});
        // Equipar item
        else {
          item.equipado = true;
          switch (item.slot) {
            case 'arma':
              const armas = charDb.char.armas;
              if (armas.armaPrimaria.id && armas.armaSecundaria.id) {
                item.id = id;
                armas.armaPrimaria = item;
                await interaction.update({
                  content: '✅ Você equipou ' + item.nome + ' no slot de Arma Primária.',
                  ephemeral: true,
                  embeds: msgObj().embeds,
                  components: staticEmbed.components
                });
              } else if ([armas.armaPrimaria.id, armas.armaSecundaria.id].includes(id)) {
                await interaction.update({
                  content: '❌ Você já equipou esse item.',
                  ephemeral: true,
                  embeds: msgObj().embeds,
                  components: staticEmbed.components
                });
              } else if (!armas.armaPrimaria.id) {
                item.id = id;
                armas.armaPrimaria = item;
                await interaction.update({
                  content: '✅ Você equipou ' + item.nome + ' no Slot de Arma Primária.',
                  ephemeral: true,
                  embeds: msgObj().embeds,
                  components: staticEmbed.components
                });
              } else if (!armas.armaSecundaria.id && armas.armaPrimaria.id) {
                item.id = id;
                armas.armaSecundaria = item;
                await interaction.update({
                  content: '✅ Você equipou ' + item.nome + ' no Slot de Arma Secundária.',
                  ephemeral: true,
                  embeds: msgObj().embeds,
                  components: staticEmbed.components
                });
              }
              await setChar(user, 'armas', armas);
              break;

            default:
              item.id = id;
              charDb.char.equipamentos[item.slot] = item;

              await setChar(user, 'equipamentos', charDb.char.equipamentos);
              break;
          }
          return await setInventory(user, id, item);
        }
      default:
        if (interaction.user.id !== user.id) {
          staticEmbed.components = [];
          return interaction.reply(staticEmbed);
        } else return interaction.reply(staticEmbed);
    }
  }

  static async fetchUser(interaction) {
    return await (async () => {
      const userId = await db.get(`${interaction.guildId}.charMessages.${interaction.message.id}`);
      const member = await interaction.guild.members.fetch({user: userId});
      return member.user;
    })();
  }
}
function generateButtons() {
  return Object.entries(assets.itens).map(([slot, emoji]) => {
    return new ButtonBuilder().setCustomId(slot).setStyle(ButtonStyle.Primary).setEmoji(emoji);
  });
}

async function sortItems() {
  const serverItems = db.table('server_items');
  const itemList = await serverItems.all();
  itemList.map(async (item, index) => {
    const value = item.value;

    if (item.id !== index.toString()) {
      await serverItems.delete(`${item.id}`);
      await serverItems.set(`${index}`, value);
    }
  });
}
async function getInventory(user) {
  const chosenChar = await db.get(`${user.id}.chosenChar`);
  return {
    mochila: await db.get(`${user.id}.chars.${chosenChar}.mochila`),
    char: await db.get(`${user.id}.chars.${chosenChar}`)
  };
}
async function setChar(user, itemStr, item) {
  const chosenChar = await db.get(`${user.id}.chosenChar`);
  return await db.set(`${user.id}.chars.${chosenChar}.${itemStr}`, item);
}
async function setInventory(user, itemId, item) {
  const chosenChar = await db.get(`${user.id}.chosenChar`);
  return await db.set(`${user.id}.chars.${chosenChar}.mochila.${itemId}`, item);
}
