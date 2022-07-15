import { Message } from "discord.js";

export default {
  event: "messageCreate",
  name: "Diga Olá",
  description: "O bot dirá olá. Comando feito por razões de teste.",

  /**@param {Message} msg A mensagem que executou este comando*/
  async execute(msg) {
    msg.reply("Olá!");
  },
};
