import { ButtonInteraction } from "discord.js";
import { Interaction } from "../structures/SDA/Interaction.js";

export const data = {
  event: "interactionCreate",
  type: "buttonInteraction",
  name: "Interagir com o PlayCard",
  description: "Interage com o playCard ao pressionar um botão azul.",
};
/**@param {ButtonInteraction} interaction - O botão que inicializou este comando. */
export async function execute(interaction) {
  if (interaction.customId === "interact") {
    const panel = new Interaction(interaction);
    await panel.handle();
  }
}
