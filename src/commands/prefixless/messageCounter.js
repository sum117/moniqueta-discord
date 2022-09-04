import {db} from '../../db.js';

const msgTop = db.table('msgTop');
export const data = {
  event: 'messageCreate',
  name: 'Contador de Mensagens',
  description: 'Automaticamente conta as mensagens de cada jogador.'
};

export async function execute(client, msg) {
  client.memberCounter.set(msg.author.id, Date.now());
  const currentValue = await msgTop.get(`${msg.author.id}`);
  return msgTop.set(`${msg.author.id}`, currentValue + 1);
}