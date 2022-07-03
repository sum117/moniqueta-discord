const PlaycardPlayer = require("../structures/SDA/PlayCardPlayer");
const Discord = require("discord.js");
module.exports = {
  name: "interactionCreate",
  /**@param {Discord.Interaction} interaction A interação que ativou o evento */
  async execute(interaction) {
    interaction.reply('Ainda não configurado...')
  },
};
