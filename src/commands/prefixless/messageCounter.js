const { db } = require("../../db.js");
module.exports = {
  event: "messageCreate",
  name: "Contador de Mensagens",
  description: "Automaticamente conta as mensagens de cada jogador.",
  async execute(msg) {
    const currentValue = await db.get(msg.author.id);
    db.set(`msgTop_${msg.author.id}`, currentValue + 1);
  },
};
