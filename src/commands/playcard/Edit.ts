import {
  ApplicationCommandOptionType,
  BaseMessageOptions,
  CommandInteraction,
  EmbedBuilder
} from 'discord.js';
import {Discord, Slash, SlashGroup, SlashOption} from 'discordx';

import {getLastMessageId} from '../../../prisma';
import {ErrorMessage} from '../../util/ErrorMessage';
import {Util} from '../../util/Util.js';

@Discord()
@SlashGroup({
  name: 'playcard',
  description: 'Grupo de comandos para o sistema de playcard.'
})
@SlashGroup('playcard')
export class Playcard {
  @Slash({
    name: 'editar',
    description: 'Edita o último post do Playcard.'
  })
  async edit(
    @SlashOption({
      description: 'Novo conteúdo do post.',
      name: 'conteudo',
      type: ApplicationCommandOptionType.String,
      required: true
    })
    newContent: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply({ephemeral: true});
    try {
      const lastMessage = await this._getLastContent(interaction);
      if (!lastMessage) return;
      const newEmbed = EmbedBuilder.from(lastMessage.embed);
      const reply = {} as BaseMessageOptions;
      Util.handleAttachment(lastMessage.message, reply, newEmbed);
      newEmbed.setDescription(newContent);
      await lastMessage.message.edit({embeds: [newEmbed]});

      return interaction.editReply('Post editado com sucesso!');
    } catch (err) {
      return console.log(err);
    }
  }

  private async _getLastContent(interaction: CommandInteraction) {
    if (!interaction.channel) return;

    const user = await getLastMessageId(interaction);
    if (!user) throw new Error(ErrorMessage.NoUser);

    const lastMessage = await interaction.channel?.messages.fetch(user?.lastMessageId ?? '');
    if (!lastMessage) throw new Error(ErrorMessage.NoLastMessage);

    const lastEmbed = lastMessage.embeds?.[0];
    if (!lastEmbed) throw new Error(ErrorMessage.NoLastEmbed);

    return {
      embed: lastEmbed,
      message: lastMessage,
      content: lastMessage.embeds?.[0].description ?? null
    };
  }
}
