import {CommandInteraction, EmbedBuilder,Message} from 'discord.js';

import {getCurrentChar} from '../../prisma';
import {sumAssets} from '../resources';
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
  interaction: Message | CommandInteraction;

  constructor(interaction: Message | CommandInteraction) {
    const user = interaction instanceof Message ? interaction.author : interaction.user;
    super({
      footer: {
        text: `ID: ${user.username}`,
        iconURL: user.displayAvatarURL({size: 128})
      }
    });

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

  public async profile() {
    const char = await this._fetch();
    const getHyperlinkOnExceed = (text: string, maxLength = 1024) => {
      if (text.length > maxLength) {
        return  `${text.slice(0,924)} [Clique aqui para ver o restante!](${Util.hastebin(text)})`;
      }
      return text;
    };
    this.setTitle(`Exibindo perfil de ${char?.name}`).addFields(
      {
        name: 'Personalidade',
        value: getHyperlinkOnExceed(char?.personality ?? 'Valor Ausente')
      },
      {
        name: 'Aparência',
        value: getHyperlinkOnExceed(char?.appearance ?? 'Valor Ausente')
      },
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
    return this;
  }

  public async post() {
    if (!(this.interaction instanceof Message)) return;
    await this._fetch();
    if (this.interaction.content.length < 1) return this;
    this.setDescription(this.interaction.content);
    return this;
  }

  private async _fetch(message = this.interaction) {
    const char = await getCurrentChar(message);
    if (char) {
      const {name, avatar, sum} = char;
      this.setTitle(name)
        .setThumbnail(avatar)
        .setColor(sumAssets[sum].color)
        .setTimestamp(Date.now());
      if (char?.title)
        this.setAuthor({
          name: char.title.name,
          iconURL: char.title.iconURL
        });
    }

    return char;
  }
}
