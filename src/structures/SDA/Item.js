import {bold} from '@discordjs/builders';
import {db} from '../../db.js';
import {title, embedComponent} from '../../util';
import {Combat} from './Combat.js';

export class Item extends Combat {
  constructor() {
    super();
  }

  static async create(item = {}) {
    const {nome, desc, base, tipo, multiplicador = {num: 0, tipo: ''}, valor} = item;
    const serverItems = db.table('server_items');
    const id = (await serverItems.all()).length + 1;
    const itemObject = {nome, desc, base, tipo, multiplicador, valor};
    await serverItems.set(`${id}`, itemObject);
    return await embedComponent(
      `✅ ${bold(nome)} criado com sucesso:\n\n${Object.entries(itemObject)
        .map(
          ([key, value]) =>
            `${bold(title(key))}: ${title(
              `${typeof value === 'object' ? `\n> ${value.num}\n> ${title(value.tipo)}` : value}`,
            )}`,
        )
        .join('\n')}`,
    );
  }

  static async delete(id) {
    const serverItems = db.table('server_items');
    const item = await serverItems.get(id);
    if (!item) return `❌ Item não encontrado`;
    await serverItems.delete(id);
    return await embedComponent(`✅ ${bold(item.nome)} deletado com sucesso`);
  }

  static async show(id) {
    const serverItems = db.table('server_items');
    const item = await serverItems.get(id);
    if (!item) return `❌ Item não encontrado`;
    return await embedComponent(
      `✅ ${bold(item.nome)}:\n${Object.entries(item)
        .map(([key, value]) => `${bold(title(key))}: ${title(toString(value))}`)
        .join('\n')}`,
    );
  }

  static async give(id = '', givingUser, receivingUser, quantia = 1) {
    const serverItems = db.table('server_items');
    const serverItem = await serverItems.get(id);
    const givingUserItems = (await getInventory(givingUser)).items;
    const givingUserItem = (await givingUserItems?.[id]) ?? {};
    const {items: receivingUserItems, char: receivingUserChar} = await getInventory(receivingUser);
    const receivingUserItem = (await receivingUserItems?.[id]) ?? {};

    if (!serverItem) return await embedComponent(`❌ Item não encontrado`);

    if (givingUserItem?.quantia === 0) return await embedComponent(`❌ Você não tem ${serverItem.nome}`);
    if (givingUserItem?.quantia < quantia)
      return await embedComponent(`❌ Você não tem ${bold(quantia)} de ${bold(serverItem.nome)}`);

    givingUserItem.quantia = givingUserItem.quantia - quantia;
    await setInventory(givingUser, id, givingUserItem);
    await setInventory(receivingUser, id, {...serverItem, quantia: receivingUserItem.quantia + quantia});

    return await embedComponent(
      `✅ ${bold(serverItem.nome)} adicionado ao inventário de ${bold(receivingUserChar.nome)}. Ele foi dado por ${bold(
        user.username,
      )}`,
    );
  }
}
async function getInventory(user) {
  await db.get(`${user.id}.chosenChar`);
  return {
    items: await db.get(`${user.id}.chars.${chosenChar}.items`),
    char: await db.get(`${user.id}.chars.${chosenChar}`),
  };
}
async function setInventory(user, itemId, item) {
  return await db.set(`${user.id}.chars.${chosenChar}.items.${itemId}`, item);
}
