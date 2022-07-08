import { MessageActionRow, MessageButton, Message } from "discord.js";

export default {
  event: "messageCreate",
  name: "Diga Olá",
  description: "O bot dirá olá. Comando feito por razões de teste.",

  /**@param {Message} msg A mensagem que executou este comando*/
  async execute(msg) {
    msg.reply({
      content:
        "Olá! Está testando algum comando? Se sim, aperte no botão abaixo.",
      components: [
        new MessageActionRow().addComponents([
            new MessageButton()
            .setCustomId("playcardTesting")
            .setLabel("Bem aqui!")
            .setStyle("SUCCESS"),
        ]),
      ],
    });
  },
};
