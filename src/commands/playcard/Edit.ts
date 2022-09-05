import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
  EmbedBuilder,
  ReplyMessageOptions,
} from 'discord.js';
import { Slash, SlashGroup, SlashOption, Discord, Guard } from 'discordx';
import { prisma } from '../../../prisma/prisma.js';
import { Post } from './Post';
import { isAllowedParent } from '../../guards';

enum ErrorMessages {
  NoUser = 'Usuário não encontrado no banco de dados. Você talvez nem tenha um personagem.',
  NoLastMessage = 'Você não possui nenhum post no canal atual, ou ele foi deletado.',
  NoLastEmbed = 'O último post não possui um embed, ou ele foi deletado.',
}
@Discord()
@Guard(isAllowedParent)
@SlashGroup({
  name: 'playcard',
  description: 'Grupo de comandos para o sistema de playcard.',
})
@SlashGroup('playcard')
export class Edit extends Post {
  @Slash({
    name: 'editar',
    description: 'Edita o último post do Playcard.',
  })
  async edit(
    interaction: CommandInteraction,
    @SlashOption({
      description: 'Novo conteúdo do post.',
      name: 'conteudo',
      required: true,
      autocomplete: async function (
        this: Edit,
        interaction: AutocompleteInteraction,
      ): Promise<void> {
        try {
          await this._getLastContent(interaction);
        } catch {
          interaction.respond([]);
        }
      },
      type: ApplicationCommandOptionType.String,
    })
    newContent: string,
  ) {
    try {
      const lastMessage = await this._getLastContent(interaction);
      if (!lastMessage) return;
      const newEmbed = EmbedBuilder.from(lastMessage.embed);
      const reply = {} as ReplyMessageOptions;
      this._handleAttachment(lastMessage.message, reply, newEmbed);
      await lastMessage.message.edit({ embeds: [newEmbed] });
    } catch (err: any) {
      return interaction.reply(err.message);
    }
  }

  private async _getLastContent(
    interaction: CommandInteraction | AutocompleteInteraction,
  ) {
    if (!interaction.channel) return;

    const user = await prisma.user.findUnique({
      where: {
        id: interaction.user.id,
      },
      select: {
        lastMessageId: true,
      },
    });
    if (!user) throw new Error(ErrorMessages.NoUser);

    const lastMessage = await interaction.channel?.messages.fetch(
      user.lastMessageId,
    );
    if (!lastMessage) throw new Error(ErrorMessages.NoLastMessage);

    const lastEmbed = lastMessage.embeds?.[0];
    if (!lastEmbed) throw new Error(ErrorMessages.NoLastEmbed);

    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);

      if (focusedOption.name === 'conteudo') {
        return interaction.respond([
          { name: 'conteudo', value: lastEmbed?.description ?? '' },
        ]);
      }
    } else {
      return {
        embed: lastEmbed,
        message: lastMessage,
        content: lastMessage.embeds?.[0].description ?? null,
      };
    }
  }
}
