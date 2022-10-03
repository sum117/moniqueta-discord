import {
  BaseMessageOptions,
  Collection,
  CommandInteraction,
  EmbedBuilder,
  Message,
  userMention
} from 'discord.js';

interface FetchOptions {
  before?: string;
  after?: string;
  limit: number;
}
export class Util {
  public static handleAttachment(message: Message, reply: BaseMessageOptions, embed: EmbedBuilder) {
    const attachment = message.attachments.first();
    const apiImageURL = message.embeds[0]?.image?.url;
    embed.data.description = embed.data.description?.replace(/<@\d{17,21}>/g, '');
    if (message.mentions.users) {
      const mentions = message.mentions.users.map(user => userMention(user.id));
      reply.content = mentions.join(',');
    }
    if (attachment) {
      const attachmentName = attachment.url.split('/').pop();
      embed.setImage('attachment://' + attachmentName);
      reply.files = [
        {
          attachment: attachment.attachment,
          name: attachmentName
        }
      ];
    } else if (apiImageURL) {
      embed.setImage('attachment://' + apiImageURL.split('/').pop());
    }
    reply.embeds = [embed];
  }

  public static delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

  public static titleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  public static async monsterFetch(interaction: CommandInteraction, options: FetchOptions) {
    if (!interaction.deferred || !interaction.replied) await interaction.deferReply();

    const errorMessages = {
      invalidInteraction: 'O objeto de interação não é válido.',
      invalidPositionalParam: 'O parâmetro "before" ou "after" não é válido.',
      fetchingError:
        'Ocorreu um erro ao buscar as mensagens ou editar a mensagem de carregamento: ',
      noMessagesInChannel: 'Não há mensagens neste canal.'
    };

    const loadingText = 'Carregando mensagens...\n';
    const loadedText = 'Mensagens carregadas.';
    if (!(interaction instanceof CommandInteraction))
      return console.log(errorMessages.invalidInteraction);

    // Check if the options provided are indeed messages that exist in the channel.

    if (options.after) {
      try {
        await interaction.channel?.messages.fetch({...options, limit: 2});
      } catch {
        return interaction.editReply(errorMessages.invalidPositionalParam);
      }
    } else {
      if (!interaction.channel?.lastMessageId)
        return interaction.editReply(errorMessages.noMessagesInChannel);
      options.before = interaction.channel.lastMessageId;
    }

    const delay = (s: number) => new Promise(resolve => setTimeout(resolve, s * 1000));
    const loadingMessage = await interaction.channel?.send(loadingText);
    if (!loadingMessage) return;
    const fetchWithMode = (
      option: 'top/bottom' | 'bottom/top'
    ): Promise<Collection<string, Message>> => {
      const quocient = Math.ceil(options.limit / 100) < 1 ? 1 : Math.ceil(options.limit / 100);
      let messages: Collection<string, Message> = new Collection();
      return new Promise(async (resolve, reject) => {
        if (!interaction.channel?.messages) return;
        for (let i = 0; i < quocient; i++) {
          try {
            await delay(5);
            const fetchedMessages = await interaction.channel?.messages.fetch({
              ...options,
              limit: 100
            });
            messages = messages.concat(messages, fetchedMessages);

            const positionalOption = option === 'top/bottom' ? 'after' : 'before';

            if (positionalOption === 'after')
              options[positionalOption] = fetchedMessages.reverse().last()?.id ?? '';
            else options[positionalOption] = fetchedMessages.last()?.id ?? '';
            if (options[positionalOption] === '') {
              resolve(messages);
              loadingMessage.edit(loadedText);
              break;
            }

            await loadingMessage.edit(`${loadingText} ${i + 1}/${quocient}`);
            if (i === quocient - 1) {
              resolve(messages);
              loadingMessage.edit(loadedText);
            }
          } catch (err) {
            reject(console.log(errorMessages.fetchingError + err));
            break;
          }
        }
      });
    };

    if (options.after) return fetchWithMode('top/bottom');
    return fetchWithMode('bottom/top');
  }
  public static async hastebin(text: string) {
    const res = await fetch('https://hastebin.com/documents', {
      method: 'POST',
      body: text
    });
    const body = await res.json();
    return `https://hastebin.com/raw/${body.key}`;
  }
  public static decimalToHexColor(decimal: number) {
    const hex = decimal.toString(16);
    return `#${hex.padStart(6, '0')}`;
  }
  public static isValidImageURL(url: string) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }
}
