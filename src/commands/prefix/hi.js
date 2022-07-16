import { Message } from "discord.js";

export const data = {
  event: "messageCreate",
  name: "Diga Olá",
  description: "O bot dirá olá. Comando feito por razões de teste.",
};

/**@param {Message} msg A mensagem que executou este comando*/
async function execute(msg) {
  msg.reply("Olá!");
}
