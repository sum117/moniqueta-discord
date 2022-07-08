import { CommandInteraction } from "discord.js";
import { PlayCardPlayer } from "../structures/SDA/PlayCardPlayer.js";
import { SlashCommandBuilder as SCB } from "@discordjs/builders";

export default {
  event: "interactionCreate",
  data: new SCB()
    .setName("playcard")
    .setDescription("Interage com todas as funções do playcard.")
    .addSubcommand((send) =>
      send
        .setName("enviar")
        .setDescription("Envia uma mensagem com o playcard.")
        .addStringOption((option) =>
          option
            .setName("conteudo")
            .setDescription("O conteúdo que será atribuído ao playcard")
            .setRequired(true)
        )
    )
    .addSubcommand((edit) =>
      edit
        .setName("editar")
        .setDescription("Edita a última ação do seu personagem.")
        .addStringOption((option) =>
          option
            .setName("conteudo")
            .setDescription(
              "O conteúdo da mensagem que substituirá o do último playcard postado."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((remove) =>
      remove
        .setName("remover")
        .setDescription(
          "Remove a última ação (ou uma especificada) do seu personagem."
        )
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Link ou id da mensagem a ser removida")
            .setRequired(false)
        )
    ),

  /**@param {CommandInteraction} interaction A opção que executou este comando*/
  async execute(interaction) {
    await interaction.deferReply();
    const char = new PlayCardPlayer();
    if (interaction.options.getSubcommand() === "editar") {
      const content = interaction.options.getString("conteudo");
      await char.interact(interaction, "edit", content);
      interaction.editReply({
        ephemeral: true,
        content: "Playcard editado com sucesso!",
      });
    } else if (interaction.options.getSubcommand() === "remover") {
      await char.interact(interaction, "remove");
      interaction.editReply({
        ephemeral: true,
        content: "Mensagem removida com sucesso!",
      });
    } else {
      const content = interaction.options.getString("conteudo");
      await char.interact(interaction, "send", content);
      interaction.deleteReply();
    }
  },
};
