import { EmbedBuilder } from 'discord.js';
import type { Message } from 'discord.js';
import { prisma } from '../../prisma/prisma.js';

export const sumAssets = {
  austera: { color: 10517508, emoji: '<:Austeros:982077481702027344>' },
  perserata: { color: 550020, emoji: '<:Perserata:982078451513184306>' },
  insanata: { color: 11535364, emoji: '<:Insanata:982078436166221874>' },
  equinocio: { color: 562180, emoji: '<:Equinocio:982082685889564772>' },
  oscuras: { color: 3146828, emoji: '<:Oscuras:982082685835051078>' },
  ehrantos: { color: 15236108, emoji: '<:Ehrantos:982082685793087578>' },
  melancus: { color: 328708, emoji: '<:Melancus:982082685801472060>' },
  observata: { color: 16777215, emoji: '<:Observata:982082685864378418>' },
  invidia: { color: 547996, emoji: '<:Invidia:982082685503696967>' },
  subtrato: { color: 8355711, emoji: '<:subtratos:1007714304319033394>' },
  humano: { color: 16493758, emoji: '<:humanos:1009521051115466843>' },
} as { [key: string]: { color: number; emoji: string } };

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
            armas: true,
            equipamentos: true,
            mochila: true,
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
          name: user.chosenChar.title.title,
          iconURL: user.chosenChar.title.iconURL,
        });
    }

    return user;
  }
}
