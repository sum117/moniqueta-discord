import {
  ButtonInteraction,
  EmbedBuilder,
  PermissionsBitField,
  Snowflake,
  userMention
} from 'discord.js';
import {ButtonComponent, Discord, Guard} from 'discordx';

import {deleteChar, handleCharSubmission, updateChar} from '../../../../prisma';
import {getCharById} from '../../../../prisma/queries/Char/getCharById';
import {CharEmbed} from '../../../components';
import {isAdmin} from '../../../guards';
import {requiredConfigChannels, sumAssets} from '../../../resources';
import {ErrorMessage} from '../../../util/ErrorMessage';

enum Feedback {
  DiscussMessage = 'Você foi adicionado a um canal de discussão. Por favor, tenha paciência e convença o administrador a aprovar seu personagem.',
  DiscussTopic = 'Discussão do personagem de ',
  DiscussChannelCreated = 'Canal de discussão criado com sucesso!'
}
const approvalMessage = (adminId: Snowflake, charOwnerId: Snowflake) =>
  `🛡️ Ficha aprovada por: ${userMention(adminId)}\n👤 Dono da ficha: ${userMention(charOwnerId)}`;
@Discord()
@Guard(isAdmin)
export class CharModal {
  @ButtonComponent({id: /char_accept_.+/})
  async accept(interaction: ButtonInteraction) {
    const charOwnerId = interaction.customId.split('_')[2];
    const charOwner = await interaction.client.users
      .fetch(charOwnerId)
      .catch(err => console.log(ErrorMessage.CannotFetchUser + ': ' + err));
    if (!charOwner) return interaction.reply(ErrorMessage.CannotFetchUser);

    const charId = parseInt(interaction.customId.split('_')[3]);
    await updateChar(charId);
    await this._acceptDenyChar(charId, interaction);
    const approvedCharChannel = interaction.guild?.channels.cache.get(
      requiredConfigChannels.approvedCharacterChannel
    );
    const profile = await new CharEmbed(interaction, charOwner).profile(false, charId, {
      displayExtra: false
    });

    if (approvedCharChannel && approvedCharChannel.isTextBased()) {
      approvedCharChannel.send({
        content: approvalMessage(interaction.user.id, charOwnerId),
        embeds: [profile]
      });
    }
  }

  @ButtonComponent({id: /char_discuss_.+/})
  async discuss(interaction: ButtonInteraction) {
    const charId = parseInt(interaction.customId.split('_')[3]);
    await this._handleDiscussion(charId, interaction);
  }

  @ButtonComponent({id: /char_deny_.+/})
  async deny(interaction: ButtonInteraction) {
    const charId = parseInt(interaction.customId.split('_')[3]);
    await this._acceptDenyChar(charId, interaction);
    await deleteChar(charId);
  }

  private async _handleDiscussion(charId: number, interaction: ButtonInteraction) {
    const authorId = interaction.customId.split('_')[2];
    const author = await interaction.client.users.fetch(authorId).catch(err => {
      interaction.reply(ErrorMessage.CannotFetchUser);
      console.log(err);
    });
    const char = (await getCharById(charId, authorId))?.[0];
    if (!author || !char) return;

    const discussionChannel = await interaction.guild?.channels
      .create({
        name: `discussão-${author.username}`,
        parent: requiredConfigChannels.discussionTicketsCategory,
        topic: Feedback.DiscussTopic + author.username,
        permissionOverwrites: [
          {
            id: authorId,
            allow: PermissionsBitField.Flags.SendMessages
          },
          {
            id: interaction.guild?.roles.everyone,
            deny: PermissionsBitField.Flags.SendMessages
          }
        ]
      })
      .catch(err => {
        interaction.reply(ErrorMessage.CannotCreateChannel);
        console.log(err);
      });
    if (!discussionChannel) return;

    const discussEmbed = new EmbedBuilder()
      .setTitle(Feedback.DiscussTopic + author.username)
      .setThumbnail(char.avatar)
      .setColor(sumAssets[char.sum].color)
      .setDescription(Feedback.DiscussMessage)
      .setTimestamp(Date.now());

    await discussionChannel.send({
      content: `${userMention(authorId) + ' ' + userMention(interaction.user.id)}`,
      embeds: [discussEmbed]
    });

    await interaction
      .reply({content: Feedback.DiscussChannelCreated, fetchReply: true})
      .then(msg =>
        setTimeout(
          () => msg.delete().catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage)),
          5000
        )
      );
  }

  private async _acceptDenyChar(charId: number, interaction: ButtonInteraction) {
    const charSubmission = await handleCharSubmission.get(charId);
    if (charSubmission) {
      const messageIdBundle = charSubmission.messageIdBundle.split(',');
      const deletedMessages = new Promise<void>(async resolve => {
        for (let i = 0; i < messageIdBundle.length; i++) {
          const messageId = messageIdBundle[i];
          const message = await interaction.channel?.messages.fetch(messageId).catch(err => {
            console.log(err);
            interaction.reply(ErrorMessage.CannotFetchSheet);
          });
          if (message && message.deletable) {
            await message
              .delete()
              .catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage));
          }
          if (i === messageIdBundle.length - 1) return resolve();
        }
      });
      await deletedMessages;
      await handleCharSubmission.delete(charId);
    }
  }
}
