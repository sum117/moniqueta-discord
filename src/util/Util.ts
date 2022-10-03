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
  public static async   monsterFetch(interaction: CommandInteraction, options: FetchOptions) {
    const errorMessage = {
      couldNotFetch: 'Não fui capaz de efetuar fetch nas mensagens: ',
      messageDoesNotExist: 'A mensagem informada no parâmetro não existe.'

    }
    const fetch = async (options: FetchOptions) => interaction.channel?.messages.fetch({...options}).catch(err => console.log(errorMessage.couldNotFetch + err));

    const quocient = Math.ceil(options.limit / 100);
    let loadingBar: string[] = new Array(quocient).fill('=');
    const loadingMessage = await interaction.editReply({content: `[${loadingBar.join('')}]` });

    let messages: Collection<string, Message<boolean>> = new Collection();
    await new Promise(async (resolve, reject) => {
      for (let index = 0; index < quocient; index++) {
        options.limit = 100;
        const fetchedMessages = await fetch(options);
        if (!fetchedMessages) {
          reject(errorMessage.messageDoesNotExist)
          break;
        }

        messages = messages.concat(fetchedMessages);
        if (options.after) options.after = fetchedMessages.first()?.id;
        if (options.before) options.before = fetchedMessages.last()?.id;
        if (loadingMessage.editable) {
         loadingBar = loadingBar.fill('#', 0, index);
          await loadingMessage.edit({content: `[${loadingBar.join('')}]`});
        }
        if (index === quocient - 1) {
          resolve(messages);
          loadingBar = loadingBar.fill('#');
          loadingMessage.edit({content: `✅ [${loadingBar.join('')}]`});
          break;
        }

      }
    })
    return messages;
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
