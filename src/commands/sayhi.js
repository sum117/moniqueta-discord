import { MessageActionRow, MessageButton, Message } from "discord.js";

export default {
  event: "messageCreate",
  name: "Diga Olá",
  description: "O bot dirá olá. Comando feito por razões de teste.",

  /**@param {Message} msg A mensagem que executou este comando*/
  execute({reply}) {
    reply({
      content:
        "Olá! Está testando algum comando? Se sim, aperte no botão abaixo.",
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("testingCommands")
            .setLabel("Bem aqui!")
            .setStyle("SUCCESS"),
        ]),
      ],
    });
  },
};
