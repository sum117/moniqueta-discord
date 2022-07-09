import { ButtonInteraction } from "discord.js";
import { Interaction } from "../structures/SDA/Interaction.js";

export default {
  event: "interactionCreate",
  type: "buttonInteraction",
  /**@param {ButtonInteraction} interaction - O botão que inicializou este comando. */
  async execute(interaction) {
    if (interaction.customId === "interact") {
      const panel = new Interaction(interaction);
      await panel.handle();
    }
  },
};
