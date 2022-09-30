import type {Message} from 'discord.js';
import {EmbedBuilder} from 'discord.js';
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
  message: Message;

  constructor(message: Message) {
    super({
      footer: {
        text: `ID: ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({size: 128})
      }
    });

    this.message = message;
  }

  public static submission(charSubmission: CharSubmissionProps) {
    const genderLocaleDictionary = {
      female: 'Feminino',
      male: 'Masculino',
      lgbtqp: 'LGBTQ+',
      any: 'Não Especificado'
    };

    let embeds: EmbedBuilder[] = [];
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

    for (let each of [
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
    this.setTitle(`Exibindo perfil de ${char?.name}`).addFields(
      {
        name: 'Personalidade',
        value: char?.personality.slice(0, 1024) ?? 'Valor Ausente'
      },
      {
        name: 'Aparência',
        value: char?.appearance.slice(0, 1024) ?? 'Valor Ausente'
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
    await this._fetch();
    if (this.message.content.length < 1) return this;
    this.setDescription(this.message.content);
    return this;
  }

  private async _fetch(message = this.message) {
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
