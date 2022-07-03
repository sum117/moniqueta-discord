const PlaycardPlayer = require("../structures/SDA/PlayCardPlayer");
const Discord = require("discord.js");
module.exports = {
  name: "interactionCreate",
  /**@param {Discord.Interaction} interaction A interação que ativou o evento */
  async execute(interaction) {
    const playcard = new PlaycardPlayer();
    playcard.create(interaction, {
      name: "WillianBill",
      appearance: "Bonitão",
      avatar:
        "https://thumbs.dreamstime.com/b/rimu-gigante-fornece-o-apoio-para-p%C3%A9-outras-plantas-vista-que-olha-acima-aos-ramos-superiores-de-uma-%C3%A1rvore-do-com-planta-151814390.jpg",
      gender: "Masculino",
      personality: "Super legal.",
      sum: "austera",
    });
  },
};
