const Discord = require("discord.js");
module.exports = {
  event: "messageCreate",
  name: "Diga Olá",
  description: "O bot dirá olá. Comando feito por razões de teste.",

  /**@param {Discord.Message} msg A mensagem que executou este comando*/
  execute(msg) {
    msg.reply({
      content:
        "Olá! Está testando algum comando? Se sim, aperte no botão abaixo.",
      components: [
        new Discord.MessageActionRow().addComponents([
          new Discord.MessageButton()
            .setCustomId("testingCommands")
            .setLabel("Bem aqui!")
            .setStyle("SUCCESS"),
        ]),
      ],
    });
  },
};
