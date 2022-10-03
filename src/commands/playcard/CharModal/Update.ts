import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import {ButtonComponent, Discord, ModalComponent, Slash, SlashGroup, SlashOption} from 'discordx';

import {updateCharField} from '../../../../prisma';
import {getCharById} from '../../../../prisma/queries/Char/getCharById';
import {CharEmbed} from '../../../components';
import {ErrorMessage} from '../../../util/ErrorMessage';
import {Util} from '../../../util/Util';
import {handleShowCharNames} from '../Choose';

enum CharUpdatePossibility {
  Name = 'name',
  Appearance = 'appearance',
  Personality = 'personality',
  Ability = 'ability',
  Avatar = 'avatar'
}
enum CharLocaleLabels {
  Name = 'Nome',
  Appearance = 'Aparência',
  Personality = 'Personalidade',
  Ability = 'Habilidade',
  Avatar = 'Avatar'
}
enum CharUpdateModalPlaceholders {
  Name = 'Novo Nome',
  Appearance = 'Nova Aparência',
  Personality = 'Nova Personalidade',
  Ability = 'Nova Habilidade',
  Avatar = 'Novo Avatar (USE LINK VÁLIDO)'
}

enum Feedback {
  Success = 'Você atualizou o(a) personagem com sucesso.'
}
@Discord()
export class Playcard {
  @SlashGroup('playcard')
  @Slash({name: 'atualizar', description: 'Atualiza um personagem a sua escolha.'})
  public async popup(
    @SlashOption({
      name: 'personagem',
      description: 'O personagem a ser atualizado',
      autocomplete: handleShowCharNames(),
      type: ApplicationCommandOptionType.Number,
      required: true
    })
    character: number,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply({ephemeral: true});
    const isCharOwner = (await getCharById(character, interaction.user.id))?.[0];
    if (!isCharOwner) return interaction.editReply({content: ErrorMessage.NotCharOwner});
    const charEmbed = await new CharEmbed(interaction).profile(false, character);
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`char_update_${CharUpdatePossibility.Name}_${character}`)
        .setLabel('Nome')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`char_update_${CharUpdatePossibility.Appearance}_${character}`)
        .setLabel('Aparência')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`char_update_${CharUpdatePossibility.Personality}_${character}`)
        .setLabel('Personalidade')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`char_update_${CharUpdatePossibility.Ability}_${character}`)
        .setLabel('Habilidade')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`char_update_${CharUpdatePossibility.Avatar}_${character}`)
        .setLabel('Avatar')
        .setStyle(ButtonStyle.Primary)
    );
    interaction.editReply({
      embeds: [charEmbed],
      components: [buttons]
    });
  }

  @ButtonComponent({id: /char_update_\w+_\d+/})
  public async update(interaction: ButtonInteraction) {
    const [_namespace, _actionPlaceholder, updateOption, characterId] =
      interaction.customId.split('_');
    const isSmallInput =
      updateOption === CharUpdatePossibility.Name || updateOption === CharUpdatePossibility.Avatar;
    const input = new TextInputBuilder()
      .setStyle(isSmallInput ? TextInputStyle.Short : TextInputStyle.Paragraph)
      .setCustomId(`char_update_${updateOption}_${characterId}`)
      .setLabel(CharLocaleLabels[Util.titleCase(updateOption)])
      .setPlaceholder(CharUpdateModalPlaceholders[Util.titleCase(updateOption)])
      .setMinLength(1)
      .setMaxLength(isSmallInput ? 256 : 4000)
      .setRequired(true);

    const modal = new ModalBuilder()
      .setCustomId(`char_update_${updateOption}_${characterId}`)
      .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input))
      .setTitle('Atualizar Personagem');

    interaction.showModal(modal);
  }

  @ModalComponent({id: /char_update_\w+_\d+/})
  public async submit(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ephemeral: true});
    const [_namespace, _actionPlaceholder, updateOption, characterId] =
      interaction.customId.split('_');
    const updateData = interaction.fields.getTextInputValue(interaction.customId);
    const isInvalidLink =
      updateOption === CharUpdatePossibility.Avatar && !Util.isValidImageURL(updateData);
    if (isInvalidLink)
      return interaction.editReply({
        content: ErrorMessage.InvalidImageURL
      });

    await updateCharField(Number(characterId), updateOption, updateData);
    const updatedCharEmbed = await new CharEmbed(interaction).profile(false, Number(characterId));
    interaction.editReply({
      content: Feedback.Success,
      embeds: [updatedCharEmbed]
    });
  }
}
