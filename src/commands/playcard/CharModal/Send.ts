import { ButtonComponent, Discord, SelectMenuComponent } from "discordx";
import { CharSheet, ModalButton, SelectorCustomId } from "../../../components";
import {
  ButtonInteraction,
  Collection,
  InteractionResponse,
  SelectMenuInteraction,
} from "discord.js";
import { ErrorMessage } from "../../../util/ErrorMessage";

export const cache = new Collection<
  string,
  { chosenSum?: string; chosenPhantom?: string; chosenGender?: string }
>();

@Discord()
export class CharModal {
  @SelectMenuComponent({ id: SelectorCustomId.Sum })
  async sumSelector(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferReply();
    const newCache = cache.get(interaction.user.id) ?? {};
    Object.assign(newCache, { chosenSum: interaction.values?.[0] });
    cache.set(interaction.user.id, newCache);
    return interaction.deleteReply();
  }

  @SelectMenuComponent({ id: SelectorCustomId.Phantom })
  async phantomSelector(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferReply();
    const newCache = cache.get(interaction.user.id) ?? {};
    Object.assign(newCache, { chosenPhantom: interaction.values?.[0] });
    cache.set(interaction.user.id, newCache);
    return interaction.deleteReply();
  }

  @SelectMenuComponent({ id: SelectorCustomId.Gender })
  async genderSelector(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferReply();
    const newCache = cache.get(interaction.user.id) ?? {};
    Object.assign(newCache, { chosenGender: interaction.values?.[0] });
    cache.set(interaction.user.id, newCache);
    return interaction.deleteReply();
  }

  @ButtonComponent({ id: ModalButton.CustomId })
  async modalButton(
    interaction: ButtonInteraction
  ): Promise<InteractionResponse | void> {
    const isInvalidClick =
      Object.values(cache.get(interaction.user.id) ?? {}).length < 3;

    if (isInvalidClick)
      return interaction.reply(ErrorMessage.NotEnoughOptionsSelected);
    return interaction.showModal(CharSheet.generateModal());
  }
}
