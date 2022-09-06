import {
  CommandInteraction,
  EmbedBuilder,
  ReplyMessageOptions,
} from 'discord.js';
import { Slash, SlashGroup, SlashOption, Discord } from 'discordx';
import { getLastMessageId } from '../../../prisma';
import { Util } from '../../util/Util.js';

enum ErrorMessages {
  NoUser = 'Usuário não encontrado no banco de dados. Você talvez nem tenha um personagem.',
  NoLastMessage = 'Você não possui nenhum post no canal atual, ou ele foi deletado.',
  NoLastEmbed = 'O último post não possui um embed, ou ele foi deletado.',
}
@Discord()
@SlashGroup({
  name: 'playcard',
  description: 'Grupo de comandos para o sistema de playcard.',
})
@SlashGroup('playcard')
export class Edit {
  @Slash({
    name: 'editar',
    description: 'Edita o último post do Playcard.',
  })
  async edit(
    @SlashOption({
      description: 'Novo conteúdo do post.',
      name: 'conteudo',
      required: true,
    })
    newContent: string,
    interaction: CommandInteraction,
  ) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const lastMessage = await this._getLastContent(interaction);
      if (!lastMessage) return;
      const newEmbed = EmbedBuilder.from(lastMessage.embed);
      const reply = {} as ReplyMessageOptions;
      Util.handleAttachment(lastMessage.message, reply, newEmbed);
      newEmbed.setDescription(newContent);
      await lastMessage.message.edit({ embeds: [newEmbed] });

      return interaction.editReply('Post editado com sucesso!');
    } catch (err) {
      return console.log(err);
    }
  }

  private async _getLastContent(interaction: CommandInteraction) {
    if (!interaction.channel) return;

    const user = await getLastMessageId(interaction);
    if (!user) throw new Error(ErrorMessages.NoUser);

    const lastMessage = await interaction.channel?.messages.fetch(
      user.lastMessageId,
    );
    if (!lastMessage) throw new Error(ErrorMessages.NoLastMessage);

    const lastEmbed = lastMessage.embeds?.[0];
    if (!lastEmbed) throw new Error(ErrorMessages.NoLastEmbed);

    return {
      embed: lastEmbed,
      message: lastMessage,
      content: lastMessage.embeds?.[0].description ?? null,
    };
  }
}
