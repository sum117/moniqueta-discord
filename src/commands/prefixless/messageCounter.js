import {db} from 'db';

export default {
  event: "messageCreate",
  name: "Contador de Mensagens",
  description: "Automaticamente conta as mensagens de cada jogador.",
  async execute(msg) {
    const currentValue = await db.get(`msgTop_${msg.author.id}`);
    return db.set(`msgTop_${msg.author.id}`, currentValue + 1);
  },
};
