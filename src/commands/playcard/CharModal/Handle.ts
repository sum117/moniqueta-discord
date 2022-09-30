import {ButtonComponent, Discord, Guard} from 'discordx';
import {ButtonInteraction, EmbedBuilder, PermissionsBitField, userMention} from 'discord.js';
import {deleteChar, handleCharSubmission, updateChar} from '../../../../prisma';
import {isAdmin} from '../../../guards';
import {requiredConfigChannels, sumAssets} from '../../../resources';
import {getCharById} from '../../../../prisma/queries/Char/getCharById';
import {ErrorMessage} from '../../../util/ErrorMessage';

enum Feedback {
  DiscussMessage = 'Você foi adicionado a um canal de discussão. Por favor, tenha paciência e convença o administrador a aprovar seu personagem.',
  DiscussTopic = 'Discussão do personagem de ',
  DiscussChannelCreated = 'Canal de discussão criado com sucesso!'
}

@Discord()
@Guard(isAdmin)
export class CharModal {
  @ButtonComponent({id: /char_accept_.+/})
  async accept(interaction: ButtonInteraction) {
    const charAuthorId = interaction.customId.split('_')[2];
    const charId = parseInt(interaction.customId.split('_')[3]);
    await updateChar(charId);
    await this._acceptDenyChar(charId, interaction);
  }

  @ButtonComponent({id: /char_discuss_.+/})
  async discuss(interaction: ButtonInteraction) {
    const charAuthorId = interaction.customId.split('_')[2];
    const charId = parseInt(interaction.customId.split('_')[3]);
    await this._handleDiscussion(charId, interaction);
  }

  @ButtonComponent({id: /char_deny_.+/})
  async deny(interaction: ButtonInteraction) {
    const charAuthorId = interaction.customId.split('_')[2];
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
    const char = await getCharById(charId);
    if (!author || !char) return;

    const discussionChannel = await interaction.guild?.channels
      .create({
        name: `discussão-${author.username}`,
        parent: requiredConfigChannels.discussionTicketChannel,
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
          () =>
            msg.deletable
              ? msg.delete().catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage))
              : null,
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
          let messageId = messageIdBundle[i];
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
