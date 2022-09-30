import {ApplicationCommandOptionType, Collection, CommandInteraction, Snowflake} from 'discord.js';
import {Discord, Slash, SlashOption} from 'discordx';

import {Util} from '../util/Util';

@Discord()
export class Tools {
  @Slash({
    name: 'salvar',
    description: 'Salva as mensagens do canal em um arquivo txt'
  })
  async saveToTxt(
    @SlashOption({
      name: 'limite',
      type: ApplicationCommandOptionType.Number,
      description: 'Limite de mensagens a serem salvas',
      required: false
    })
    limit = 1000,
    @SlashOption({
      name: 'depois_da_mensagem',
      type: ApplicationCommandOptionType.String,
      description: 'ID da mensagem a partir da qual as mensagens serão salvas',
      required: false
    })
    after: Snowflake,
    interaction: CommandInteraction
  ) {
    const messages = await Util.monsterFetch(interaction, {
      before: '',
      after,
      limit
    });
    if (messages instanceof Collection) {
      const embeds = messages
        .reverse()
        .map(message => message.embeds?.[0])
        .filter(embed => embed ?? false);

      const indentText = (text: string) =>
        text
          .split('\n')
          .map(line => `    ${line}`)
          .join('\n');
      const content = embeds.map(embed => indentText(embed.description ?? '')).join('\n');
      const buffer = Buffer.from(content);
      await interaction.editReply({
        files: [
          {
            attachment: buffer,
            name: 'mensagens.txt'
          }
        ]
      });
    }
  }
}
