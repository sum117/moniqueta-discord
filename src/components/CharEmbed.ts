import { EmbedBuilder } from 'discord.js';
import type { Message } from 'discord.js';
import { prisma } from '../../prisma/prisma.js';
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
    const user = await this._fetch();
    const char = user?.chosenChar;
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
  private async _fetch(id = this.message.author.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        chosenChar: {
          include: {
            weapons: true,
            equipment: true,
            backpack: true,
            skills: true,
            title: true,
          },
        },
      },
    });
    if (user?.chosenChar) {
      const { name, avatar, sum } = user?.chosenChar;
      this.setTitle(name)
        .setThumbnail(avatar)
        .setColor(sumAssets[sum].color)
        .setTimestamp(Date.now());
      if (user?.chosenChar?.title)
        this.setAuthor({
          name: user.chosenChar.title.name,
          iconURL: user.chosenChar.title.iconURL,
        });
    }

    return user;
  }
}
