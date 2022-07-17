import {db} from '../../db.js';

export const data = {
  event: 'messageCreate',
  name: 'Contador de Mensagens',
  description: 'Automaticamente conta as mensagens de cada jogador.',
};
export async function execute(client, msg) {
  const moniqueta = client;
  moniqueta.memberCounter.set(msg.author.id, Date.now());
  const currentValue = await db.get(`msgTop_${msg.author.id}`);
  return db.set(`msgTop_${msg.author.id}`, currentValue + 1);
}
