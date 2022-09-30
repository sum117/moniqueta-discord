import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  ModalSubmitInteraction,
  userMention
} from 'discord.js';
import {Discord, ModalComponent} from 'discordx';

import {createChar, handleCharSubmission} from '../../../../prisma';
import {CharEmbed, ErrorMessage, Modal, ModalCustomId} from '../../../components';
import {requiredConfigChannels} from '../../../resources';
import {cache} from './Send';

enum Feedback {
  CharacterFrom = 'Personagem de ',
  Success = 'Personagem enviado para a revisão!',
  InvalidImage = 'Link de Imagem Inválido. Por favor, certifique-se de que o link é válido e que o arquivo é uma imagem para evitar problemas futuros.'
}

enum ButtonLabel {
  Accept = 'Aceitar',
  Discuss = 'Discutir',
  Deny = 'Recusar'
}

@Discord()
export class CharModal {
  @ModalComponent({id: Modal.CustomId})
  async receive(interaction: ModalSubmitInteraction) {
    const userSelectChoices = cache.get(interaction.user.id);
    const [name, personality, physicalInfo, ability, imageLink] = [
      ModalCustomId.Name,
      ModalCustomId.Personality,
      ModalCustomId.PhysicalInfo,
      ModalCustomId.Ability,
      ModalCustomId.Link
    ].map(id => interaction.fields.getTextInputValue(id));
    const imageRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/i;
    if (!imageLink.match(imageRegex)) return interaction.reply(Feedback.InvalidImage);
    if (
      !userSelectChoices?.chosenGender ||
      !userSelectChoices?.chosenSum ||
      !userSelectChoices?.chosenPhantom
    )
      return interaction.reply(ErrorMessage.UndefinedSelectValue);
    const newCharacter = {
      authorId: interaction.user.id,
      name,
      personality,
      ability,
      avatar: imageLink,
      appearance: physicalInfo,
      gender: userSelectChoices.chosenGender,
      sum: userSelectChoices.chosenSum,
      phantom: userSelectChoices.chosenPhantom
    };
    await interaction.reply({ephemeral: true, content: Feedback.Success});
    const createdPendingChar = await createChar(newCharacter);
    if (!createdPendingChar) return console.log(ErrorMessage.CharDatabaseError);
    const embeds = CharEmbed.submission(newCharacter);
    const acceptBtnCustomId = `char_accept_${newCharacter.authorId}_${createdPendingChar.id}`;
    const discussBtnCustomId = `char_discuss_${newCharacter.authorId}_${createdPendingChar.id}`;
    const denyBtnCustomId = `char_deny_${newCharacter.authorId}_${createdPendingChar.id}`;
    const ActionButtons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(acceptBtnCustomId)
        .setStyle(ButtonStyle.Success)
        .setLabel(ButtonLabel.Accept)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId(discussBtnCustomId)
        .setStyle(ButtonStyle.Primary)
        .setLabel(ButtonLabel.Discuss)
        .setEmoji('🗣️'),
      new ButtonBuilder()
        .setCustomId(denyBtnCustomId)
        .setStyle(ButtonStyle.Danger)
        .setLabel(ButtonLabel.Deny)
        .setEmoji('❌')
    );
    const waitingChannel = interaction.guild?.channels.cache.get(
      requiredConfigChannels.characterSubmissionChannel
    );
    if (waitingChannel && waitingChannel.isTextBased()) {
      const messageIdBundle: string[] = [];
      for (let i = 0; i < embeds.length; i++) {
        const isFirst = i === 0;
        const isLast = i === embeds.length - 1;
        const messageSent = await waitingChannel.send({
          content: isFirst ? Feedback.CharacterFrom + userMention(interaction.user.id) : undefined,
          embeds: [embeds[i]],
          components: isLast ? [ActionButtons] : []
        });
        if (messageSent) messageIdBundle.push(messageSent.id);
      }
      await handleCharSubmission.create(
        interaction.user.id,
        createdPendingChar.id,
        messageIdBundle
      );
    }
  }
}
