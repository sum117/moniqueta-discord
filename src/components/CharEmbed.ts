import { EmbedBuilder } from 'discord.js';
import type { Message } from 'discord.js';
import { getChar } from '../../prisma';
import { sumAssets } from '../resources';
export class CharEmbed extends EmbedBuilder {
  message: Message;
  constructor(message: Message) {
    super({
      footer: {
        text: `ID: ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ size: 128 }),
      },
    });

    this.message = message;
  }
  public async profile() {
    const char = await this._fetch();
    this.setTitle(`Exibindo perfil de ${char?.name}`).addFields(
      {
        name: 'Personalidade',
        value: char?.personality.slice(0, 1024) ?? 'Valor Ausente',
      },
      {
        name: 'Aparência',
        value: char?.appearance.slice(0, 1024) ?? 'Valor Ausente',
      },
      {
        name: 'Level',
        value: char?.level.toString() ?? 'Valor Ausente',
        inline: true,
      },
      {
        name: 'Exp. Total',
        value: char?.expTotal.toString() ?? 'Valor Ausente',
        inline: true,
      },
      {
        name: 'Kills',
        value: char?.kills.toString() ?? 'Valor Ausente',
        inline: true,
      },
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
    const char = await getChar(message);
    if (char) {
      const { name, avatar, sum } = char;
      this.setTitle(name)
        .setThumbnail(avatar)
        .setColor(sumAssets[sum].color)
        .setTimestamp(Date.now());
      if (char?.title)
        this.setAuthor({
          name: char.title.name,
          iconURL: char.title.iconURL,
        });
    }

    return char;
  }
}
