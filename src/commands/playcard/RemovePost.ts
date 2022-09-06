import { Slash, SlashGroup, SlashOption, Discord } from 'discordx';
import type { CommandInteraction } from 'discord.js';
import { handleUserPost } from '../../../prisma';

enum ErrorMessages {
  InvalidContent = 'Conteúdo inválido!',
  UnknownMessage = 'Mensagem desconhecida!',
  NotMessageAuthor = 'Você não pode deletar essa mensagem pois ela não pertence a você.',
}
@Discord()
@SlashGroup('playcard')
export class RemovePost {
  @Slash({ name: 'remover', description: 'Deleta um post seu.' })
  async remove(
    @SlashOption({
      description: 'Mensagem a ser deletada.',
      name: 'link_ou_id',
      required: true,
    })
    msgToDelete: string,
    interaction: CommandInteraction,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const regex =
      /(?:https:\/\/(?:canary\.)?discord\.com\/channels\/\d+\/\d+\/)?(?<messageId>\d+)/;
    const messageToFetch = msgToDelete.match(regex)?.groups?.messageId;
    if (!messageToFetch)
      return interaction.editReply(ErrorMessages.InvalidContent);
    const fetchedMessage = await interaction.channel?.messages
      .fetch(messageToFetch)
      .catch(() => null);
    if (!fetchedMessage)
      return interaction.editReply(ErrorMessages.UnknownMessage);

    const isUserMessageAuthor = await handleUserPost(
      interaction,
      fetchedMessage,
      'delete',
    );
    if (isUserMessageAuthor) {
      await fetchedMessage.delete();
      return interaction.editReply('Mensagem deletada.');
    } else return interaction.editReply(ErrorMessages.NotMessageAuthor);
  }
}
