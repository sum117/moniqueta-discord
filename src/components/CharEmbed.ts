import {
  BaseMessageOptions,
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
  Message,
  ModalSubmitInteraction,
  User
} from 'discord.js';

import {getCurrentChar, getUser} from '../../prisma';
import {sumAssets} from '../resources';
import {ErrorMessage} from '../util/ErrorMessage';
import {Util} from '../util/Util';

interface CharSubmissionProps {
  name: string;
  personality: string;
  ability: string;
  avatar: string;
  appearance: string;
  gender: string;
  sum: string;
  phantom: string;
}

enum FieldNames {
  Gender = 'Gênero',
  Sum = 'Soma',
  Phantom = 'Fantasma'
}

export class CharEmbed extends EmbedBuilder {
  interaction: Message | CommandInteraction | ButtonInteraction | ModalSubmitInteraction;
  user: User;
  constructor(
    interaction: Message | CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
    target?: User
  ) {
    const user = target
      ? target
      : interaction instanceof Message
      ? interaction.author
      : interaction.user;
    super({
      footer: {
        text: `ID: ${user.username}`,
        iconURL: user.displayAvatarURL({size: 128})
      }
    });
    this.user = user;
    this.interaction = interaction;
  }

  public static submission(charSubmission: CharSubmissionProps) {
    const genderLocaleDictionary = {
      female: 'Feminino',
      male: 'Masculino',
      lgbtqp: 'LGBTQ+',
      any: 'Não Especificado'
    };

    const embeds: EmbedBuilder[] = [];
    embeds.push(
      new EmbedBuilder()
        .setTitle(charSubmission.name)
        .setColor(sumAssets[charSubmission.sum].color)
        .setFields([
          {
            name: FieldNames.Gender,
            value: genderLocaleDictionary[charSubmission.gender],
            inline: true
          },
          {
            name: FieldNames.Phantom,
            value: Util.titleCase(charSubmission.phantom),
            inline: true
          }
        ])
        .setThumbnail(sumAssets[charSubmission.sum].thumbnail)
        .setImage(charSubmission.avatar)
    );

    for (const each of [
      charSubmission.appearance,
      charSubmission.personality,
      charSubmission.ability
    ]) {
      embeds.push(
        new EmbedBuilder().setDescription(each).setColor(sumAssets[charSubmission.sum].color)
      );
    }
    return embeds;
  }

  public async profile(current = true, id?: number, options = {displayExtra: true}) {
    const char = await this._composeOne(current, id);
    const getHyperlinkOnExceed = async (text: string, maxLength = 1024) => {
      if (text.length > maxLength) {
        const hastebin = await Util.hastebin(text);
        return `${text.slice(0, 919)} (...) [Clique aqui para ver o restante!](${hastebin})`;
      }
      return text;
    };
    this.setTitle(`Exibindo perfil de ${char?.name}`).addFields(
      {
        name: 'Personalidade',
        value: await getHyperlinkOnExceed(char?.personality ?? 'Valor Ausente')
      },
      {
        name: 'Aparência',
        value: await getHyperlinkOnExceed(char?.appearance ?? 'Valor Ausente')
      },
      {
        name: 'Habilidade',
        value: await getHyperlinkOnExceed(char?.ability ?? 'Valor Ausente')
      }
    );
    if (options?.displayExtra) {
      this.addFields(
        {
          name: 'Level',
          value: char?.level.toString() ?? 'Valor Ausente',
          inline: true
        },
        {
          name: 'Exp. Total',
          value: char?.expTotal.toString() ?? 'Valor Ausente',
          inline: true
        },
        {
          name: 'Kills',
          value: char?.kills.toString() ?? 'Valor Ausente',
          inline: true
        }
      );
    }
    return this;
  }

  public async post(current = true, id?: number) {
    if (!(this.interaction instanceof Message)) return;
    await this._composeOne(current, id);
    if (this.interaction.content.length < 1) return this;
    this.setDescription(this.interaction.content);
    return this;
  }

  public async multiPost(message: Message) {
    const userDatabase = await getUser(this.user.id);
    const chars = userDatabase?.chars.map(char => ({
      ...char,
      prefix: char.name.split(' ')[0] + ':',
      charId: char.id
    }));
    if (!chars) return;

    const charPrefixesRegex = new RegExp(
      chars.map(charPrefix => charPrefix.prefix)?.join('|'),
      'gi'
    );

    const matches = message.content.match(charPrefixesRegex);
    if (!matches) return;

    const charActions = message.content.split(charPrefixesRegex);
    const replies = matches.map(async (match, index) => {
      const char = chars.find(char => char.prefix === match);
      if (!char) return;

      const embed = await new CharEmbed(message).post(false, char?.charId);
      if (!embed) return;

      const charAction = charActions[index + 1];
      if (charAction.length > 0) embed.setDescription(charAction);
      else return;

      const reply = {} as BaseMessageOptions;
      const attachment = message.attachments.at(index);
      if (attachment) {
        const attachmentName = attachment.url.split('/').pop();
        embed.setImage('attachment://' + attachmentName);
        reply.files = [{attachment: attachment.attachment, name: attachmentName}];
      }
      reply.embeds = [embed];
      return reply;
    });
    await message.delete().catch(() => console.log(ErrorMessage.UnknownMessage));
    return replies;
  }
  private async _composeOne(current = true, id?: number, interaction = this.interaction) {
    let char = await getCurrentChar(interaction);
    if (!current) {
      const data = (await getUser(this.user.id))?.chars.find(char => char.id === id);
      if (!data) return;
      char = data;
    }
    if (char) {
      const {name, avatar, sum} = char;
      this.setTitle(name).setThumbnail(avatar).setColor(sumAssets[sum].color);
      if (char.title) this.setAuthor({name: char.title.name, iconURL: char.title.iconURL});
    }
    return char;
  }
}
