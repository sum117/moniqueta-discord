import {
  ButtonInteraction,
  Collection,
  InteractionResponse,
  SelectMenuInteraction
} from 'discord.js';
import {ButtonComponent, Discord, SelectMenuComponent} from 'discordx';

import {CharSheet, ModalButton, SelectorCustomId} from '../../../components';
import {ErrorMessage} from '../../../util/ErrorMessage';

export const cache = new Collection<
  string,
  {chosenSum?: string; chosenPhantom?: string; chosenGender?: string}
>();

@Discord()
export class CharModal {
  @SelectMenuComponent({id: SelectorCustomId.Sum})
  async sumSelector(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferReply();
    const newCache = cache.get(interaction.user.id) ?? {};
    Object.assign(newCache, {chosenSum: interaction.values?.[0]});
    cache.set(interaction.user.id, newCache);
    return interaction.deleteReply();
  }

  @SelectMenuComponent({id: SelectorCustomId.Phantom})
  async phantomSelector(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferReply();
    const newCache = cache.get(interaction.user.id) ?? {};
    Object.assign(newCache, {chosenPhantom: interaction.values?.[0]});
    cache.set(interaction.user.id, newCache);
    return interaction.deleteReply();
  }

  @SelectMenuComponent({id: SelectorCustomId.Gender})
  async genderSelector(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferReply();
    const newCache = cache.get(interaction.user.id) ?? {};
    Object.assign(newCache, {chosenGender: interaction.values?.[0]});
    cache.set(interaction.user.id, newCache);
    return interaction.deleteReply();
  }

  @ButtonComponent({id: ModalButton.CustomId})
  async modalButton(interaction: ButtonInteraction): Promise<InteractionResponse | void> {
    const isInvalidClick = Object.values(cache.get(interaction.user.id) ?? {}).length < 3;

    if (isInvalidClick) {
      interaction
        .reply({content: ErrorMessage.NotEnoughOptionsSelected, fetchReply: true})
        .then(reply =>
          setTimeout(
            () =>
              reply.delete().catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage)),
            10 * 1000
          )
        );
      return;
    }
    return interaction.showModal(CharSheet.generateModal());
  }
}
