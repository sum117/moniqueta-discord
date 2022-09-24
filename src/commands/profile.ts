import { Discord, Slash } from "discordx";
import { createCanvas, loadImage, registerFont } from "canvas";
import { AttachmentBuilder, CommandInteraction, User } from "discord.js";

@Discord()
export class Profile {
  @Slash({ name: "profile", description: "Mostra o perfil de algum usuário." })
  public async show(interaction: CommandInteraction) {
    const profile = await this._composeProfile(interaction.user);
    return interaction.reply({ files: [profile] });
  }

  private async _composeProfile(user: User) {
    const userAvatar = await loadImage(
      user.displayAvatarURL({ size: 1024, extension: "jpg" })
    );
    const overlay = await loadImage("src/resources/assets/DiscordRankCard.png");

    registerFont("src/resources/assets/Iceland-Regular.ttf", {
      family: "Iceland",
    });
    const canvas = createCanvas(768, 384);
    const ctx = canvas.getContext("2d");

    // Initial Setup
    ctx.fillStyle = "#000";
    ctx.font = "24px Iceland";

    // Overlay Image
    ctx.drawImage(overlay, 40, 0);

    // Exp Bar
    ctx.fillStyle = "#09BC8A";
    const expPercentage = await this._getExpPercentage(user);
    ctx.fillRect(541, 208, expPercentage, 10);

    // Add radius to avatar and add avatar image
    const shoulder = 10;
    const radius = 10;
    const width = 192;
    const height = 192;
    const x = 45;
    const y = 16;
    this._getRoundedCorner(ctx, x, width, shoulder, y, radius, height);
    ctx.drawImage(userAvatar, x, y, width, height);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: `${user.username}_profile.png`,
    });
    return attachment;
  }

  private _getRoundedCorner(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    shoulder: number,
    radius: number
  ) {
    ctx.beginPath();

    // Corner 1
    ctx.lineTo(x + width - shoulder, y);
    ctx.arcTo(x + width, y, x + width, y + shoulder, radius);
    //Corner 2
    ctx.lineTo(x + width, y + height - shoulder);
    ctx.arcTo(x + width, y + height, x + width - shoulder, y + height, radius);
    //Corner 3
    ctx.lineTo(x + shoulder, y + height);
    ctx.arcTo(x, y + height, x, y + height - shoulder, radius);
    //Corner 4
    ctx.lineTo(x, y + shoulder);
    ctx.arcTo(x, y, x + shoulder, y, radius);

    // End
    ctx.closePath();
    ctx.clip();
  }

  private async _getExpPercentage(user: User): Promise<any> {
    //TODO: Get user exp and calculate percentage
    return 122;
  }
}
