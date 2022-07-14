import { CommandInteraction } from "discord.js";
import { PlayCardBase } from "../structures/SDA/PlayCardBase.js";
import { SlashCommandBuilder as SCB } from "@discordjs/builders";

export default {
  event: "interactionCreate",
  type: "slashCommand",
  name: "Play Card Base",
  description:
    "Interage com quase todas as funções do playcard a partir do Slash Command.",
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
        .addAttachmentOption((option) =>
          option
            .setName("anexo")
            .setRequired(false)
            .setDescription("Um anexo para servir de imagem para seu embed.")
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
            .setName("link")
            .setDescription("Link ou id da mensagem a ser removida")
            .setRequired(false)
        )
    ),

  /**@param {CommandInteraction} interaction A opção que executou este comando*/
  async execute(interaction) {
    if (!interaction.isCommand()) return;
    const char = new PlayCardBase();
    if (interaction.options.getSubcommand() === "editar") {
      await interaction.deferReply({ ephemeral: true });
      const content = interaction.options.getString("conteudo");
      await char.interact(interaction, "edit", content);
      interaction.editReply({
        content: "Playcard editado com sucesso!",
      });
    } else if (interaction.options.getSubcommand() === "remover") {
      await interaction.deferReply({ ephemeral: true });
      let MsgToRemove = interaction.options.getString("link");
      let match = MsgToRemove
        ? MsgToRemove.match(
            /(?:https:\/\/discord\.com\/channels\/)(?<guild>\d+)\/(?<channel>\d+)\/(?<msg>\d+)/
          )
        : null;
      await char.interact(
        interaction,
        "remove",
        match?.groups.msg ? match?.groups.msg : undefined
      );
      interaction.editReply({
        content: "Mensagem removida com sucesso!",
      });
    } else {
      await interaction.deferReply();
      const content = interaction.options.getString("conteudo");
      const attachment = interaction.options.getAttachment("anexo");
      await char.interact(
        interaction,
        "send",
        content,
        attachment ? attachment : undefined
      );
      interaction.deleteReply();
    }
  },
};
