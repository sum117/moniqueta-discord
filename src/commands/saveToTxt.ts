import {ApplicationCommandOptionType, AttachmentBuilder, CommandInteraction, Snowflake} from 'discord.js';
import {Discord, Slash, SlashOption} from 'discordx';

import { ErrorMessage } from '../util/ErrorMessage';
import {Util} from '../util/Util';

@Discord()
export class Tools {
  @Slash({
    name: 'salvar',
    description: 'Salva as mensagens do canal em um arquivo txt'
  })
  async saveToTxt(
    @SlashOption({
      name: 'depois_da_mensagem',
      type: ApplicationCommandOptionType.String,
      description: 'ID da mensagem a partir da qual as mensagens serão salvas',
      required: false
    })
    after: Snowflake,
    @SlashOption({
      name: 'antes_da_mensagem',
      type: ApplicationCommandOptionType.String,
      description: 'ID da mensagem a partir da qual as mensagens serão salvas',
      required: false
    })
    before: Snowflake,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const options = { limit: 1000, after, before };
    const messages = await Util.monsterFetch(interaction, options);
    if (!messages) return interaction.reply(ErrorMessage.CannotFetch);

    const content = messages.reverse().map(message => {
      if (message.embeds?.[0]) return message.embeds[0].description;
      return message.content;
    }).join('\n');
    const buffer = Buffer.from(content);
    const attachment = new AttachmentBuilder(buffer)
      .setName('mensagens.txt')

    return interaction.editReply({files: [attachment]});
  }
}
