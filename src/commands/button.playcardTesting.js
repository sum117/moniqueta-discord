const Discord = require("discord.js");
const PlayCardPlayer = require("../structures/SDA/PlayCardPlayer");
module.exports = {
  event: "interactionCreate",
  name: "Playcard Testing",
  description: "Um comando produzido para testar a classe do playcard.",

  /**@param {Discord.ButtonInteraction} interaction O botão que executou este comando*/
  async execute(interaction) {
    if (interaction.customId !== "testingCommands") return;
    await interaction.deferReply();
    const char = new PlayCardPlayer();
    await char.create(interaction, "994256052923146250", {
      name: "Anastasia Serperata",
      appearance: `Mesmo sem as serpentes chamaria atenção. Não é apenas um amontoado de cobras, não... há classe, há vaidade e dedicação. 

        Podia ser taxada de desnecessária. Afinal, alguém que porta tamanha beleza deve mesmo cuidar tanto de si mesma? Para ela sim. Por isso hidrata a pele, cuida de cada um dos seus vivos (literalmente) cachos atenciosamente e pratica posturas e olhares que exalam sedução. 
        
        Curvas redondas, bem acentuadas e cheias de aspecto enriquecem ainda mais o mar de ouro que é.
        
        Eis uma mulher de estatura, que porta não apenas beleza, mas sagacidade.
        
        Eis a aspirante à medusa.`,
      avatar:
        "https://cdn.discordapp.com/attachments/994256052923146250/994256454032830504/Anastasia_Serperata.jpg",
      gender: "Feminino",
      personality: "Intrigante",
      phantom: "branco",
      sum: "perserata",
    });
    const embed = char.profile(interaction.user);
    await interaction.editReply({
      content: `Exibindo perfil do personagem de ${interaction.user.username}`,
      embeds: [embed],
    });
  },
};
