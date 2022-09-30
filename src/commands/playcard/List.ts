import {Pagination, PaginationType} from '@discordx/pagination';
import {createCanvas, Image, loadImage} from '@napi-rs/canvas';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  User
} from 'discord.js';
import {ButtonComponent, Discord, Slash, SlashGroup, SlashOption} from 'discordx';

import {getUser} from '../../../prisma';
import { CharEmbed } from '../../components';
import {sumAssets} from '../../resources';
import {ErrorMessage} from '../../util/ErrorMessage';
import {Util} from '../../util/Util';
enum ButtonLabel {
  Start = 'Início',
  End = 'Fim',
  Next = 'Próximo',
  Previous = 'Anterior'
}
@Discord()
@SlashGroup('playcard')
export class Playcard {
  @Slash({name: 'listar', description: 'Lista todos os personagens do usuário'})
  async List(
    @SlashOption({
      name: 'usuario',
      type: ApplicationCommandOptionType.User,
      description: 'O usuário que você deseja ver os personagens',
      required: false
    })
    user: User,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    if (!user) user = interaction.user;
    const chars = (await getUser(user.id))?.chars;
    if (!chars) return interaction.reply(ErrorMessage.CharDatabaseError);
    const pages = await Promise.all(
      chars.map(async char =>
        loadImage(char.avatar).then(image => {
          const sumColor = sumAssets[char.sum].color;

          const canvas = this._getListItemImage(image, sumColor);

          const pageEmbed = new EmbedBuilder()
            .setTitle(char.name)
            .setAuthor({
              name: user.username,
              iconURL: user.displayAvatarURL({size: 128})
            })
            .setColor(sumColor)
            .setImage('attachment://char.png')
            .setTimestamp(char.createdAt);
          return canvas.encode('png').then(buffer => {
            return {
              files: [
                {
                  attachment: buffer,
                  name: 'char.png'
                }
              ],
              embeds: [pageEmbed],
              components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                [
                  new ButtonBuilder({
                    customId: `char_profile_${char.id}`,
                    label: "Perfil",
                    style: ButtonStyle.Primary,
                    emoji: "👤"
                  }),
                ]
              ),]
            };
          });
        })
      )
    );
    const pagination = new Pagination(interaction, pages, {
      type: PaginationType.Button,
      start: {
        label: ButtonLabel.Start,
        style: ButtonStyle.Secondary
      },
      end: {
        label: ButtonLabel.End,
        style: ButtonStyle.Secondary
      },
      next: {
        label: ButtonLabel.Next,
        style: ButtonStyle.Primary
      },
      previous: {
        label: ButtonLabel.Previous,
        style: ButtonStyle.Primary
      }
    });
    await pagination.send();
  }

  @ButtonComponent({ id: /char_profile_.+/ })
  async charProfile(interaction: ButtonInteraction) {
    const charId = interaction.customId.split('_')[2];
    console.log(charId)
    const embed = await new CharEmbed(interaction).profile(false, Number(charId))
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
  private _getListItemImage(image: Image, color: number) {
    const canvas = createCanvas(225, 350);
    const ctx = canvas.getContext('2d');
    const scaleToFill = (img: Image) => {
      // get the scale
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      // get the top left position of the image
      const x = canvas.width / 2 - (img.width / 2) * scale;
      const y = canvas.height / 2 - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeStyle = Util.decimalToHexColor(color);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    scaleToFill(image);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }
}