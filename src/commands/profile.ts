import { Discord, Slash } from "discordx";
import { createCanvas, loadImage, registerFont } from "canvas";
import { AttachmentBuilder, CommandInteraction, User } from "discord.js";
import { levels, phantomAssets, sumAssets } from "../resources";
import { getUser } from "../../prisma";
import { ErrorMessage } from "../util/ErrorMessage";

@Discord()
export class Profile {
  @Slash({ name: "profile", description: "Mostra o perfil de algum usuário." })
  public async show(interaction: CommandInteraction) {
    await interaction.deferReply();
    const profile = await this._composeProfile(interaction);
    if (!profile) return interaction.editReply(ErrorMessage.NoUser);
    return interaction.editReply({ files: [profile] });
  }

  private async _composeProfile(interaction: CommandInteraction) {
    const { user } = interaction;

    // Assets
    const userData = await getUser(user.id);
    if (!userData) return;
    const overlay = await loadImage("src/resources/assets/DiscordRankCard.png");
    const userAvatar = await loadImage(
      user.displayAvatarURL({ size: 1024, extension: "jpg" })
    );
    const userBackground = await loadImage(
      userData.profileBackground ??
        "src/resources/assets/DiscordRankCardDefaultBg.png"
    );
    const userDescription =
      userData.profileDescription ?? "Nenhuma descrição definida.";
    const userLevels = [userData.serverLevel, userData.serverLevel + 1];

    const mostUsedChars = userData.chars
      .sort((a, b) => b.level - a.level)
      .map((char) => {
        return {
          name: char.name,
          avatar: char.avatar,
          level: char.level,
          sum: char.sum,
          phantom: char.phantom,
        };
      })
      .splice(0, 4);

    const charAvatars = await Promise.all(
      mostUsedChars.map((char) => {
        if (char.avatar) return loadImage(char.avatar);
      })
    );
    const charSums = await Promise.all(
      mostUsedChars.map((char) => {
        if (char.sum) return loadImage(sumAssets[char.sum].thumbnail);
      })
    );
    const charPhantoms = await Promise.all(
      mostUsedChars.map((char) => {
        if (char.phantom)
          return loadImage(phantomAssets[char.phantom].thumbnail);
      })
    );
    const charNames = mostUsedChars.map((char) => char.name);

    registerFont("src/resources/assets/Iceland-Regular.ttf", {
      family: "Iceland",
    });
    const canvas = createCanvas(768, 384);
    const ctx = canvas.getContext("2d");

    // Initial Setup
    ctx.fillStyle = "#000";

    // Background Image
    ctx.drawImage(userBackground, 0, 0, canvas.width, canvas.height);
    // Overlay Image
    ctx.drawImage(overlay, 40, 0);

    // Shared variables between profile and character avatars
    const shoulder = 8;
    const radius = 8;

    const dimensions = {
      userAvatar: 192,
      userDescription: {
        maxWidth: 325,
        lineHeight: 16,
      },
      userExpBar: {
        height: 16,
      },
      charAvatar: 32,
      charAssets: 10,
    };

    const coordinates = {
      userAvatar: {
        x: 45,
        y: 16,
      },
      userLevel: {
        x: [517, 709],
        y: 215,
      },
      userCounter: {
        x: 172,
        y: [238, 262, 286, 310, 334, 358],
      },
      userStats: {
        x: 706,
        y: [61, 85],
      },
      userDescription: {
        x: 269,
        y: 55,
      },
      userExpBar: {
        x: 541,
        y: 208,
      },
      charAvatar: {
        x: 269,
        y: [207, 246, 286, 326],
      },
      charName: {
        x: 305,
        y: [237, 276, 316, 356],
      },
      charAsset: {
        x: [305, 315],
        y: [217, 256, 296, 336],
      },
    };

    // Compositions

    // Exp Bar
    ctx.fillStyle = "#09BC8A";
    const expPercentage = await this._getExpPercentage(
      userData.serverLevel,
      userData.serverXp
    );
    ctx.fillRect(
      coordinates.userExpBar.x,
      coordinates.userExpBar.y,
      expPercentage,
      10
    );

    // Levels
    ctx.fillStyle = "#fff";
    ctx.font = "16px Iceland";
    ctx.textAlign = "center";
    ctx.fillText(
      userLevels[0].toString(),
      coordinates.userLevel.x[0],
      coordinates.userLevel.y
    );
    ctx.fillText(
      userLevels[1].toString(),
      coordinates.userLevel.x[1],
      coordinates.userLevel.y
    );

    // Profile Description
    ctx.textAlign = "start";
    const textMaxWidth = 250;
    const isBiggerThanMaxWidth = userDescription.length > textMaxWidth;
    this._fillWrappedText(
      ctx,
      isBiggerThanMaxWidth
        ? userDescription.slice(0, textMaxWidth) + "..."
        : userDescription,
      coordinates.userDescription.x,
      coordinates.userDescription.y,
      dimensions.userDescription.maxWidth,
      dimensions.userDescription.lineHeight
    );

    // Info Tab
    ctx.font = "12px Iceland";
    ctx.textAlign = "center";

    // Last seen channel tracker
    const HandleLastSeenChannel = () => {
      const channelId = userData.serverMessages.pop()?.channelId;
      if (channelId) {
        const channel = interaction.guild?.channels.cache.get(channelId);
        if (channel) {
          return "#" + channel.name;
        }
      }
      return "N/A";
    };
    const lastSeenChannel = HandleLastSeenChannel();

    // Rest of the trackers
    const trackers = [
      userData.serverXp.toString(), // xp
      userData.chars.length.toString(), // char count
      userData.characterKills.toString(), // char kills
      lastSeenChannel, // last seen channel
      userData.serverReputation.toString(), // rep
      userData.serverCoins.toString(), // coins
    ];
    for (let i = 0; i < trackers.length; i++) {
      ctx.fillText(
        trackers[i],
        coordinates.userCounter.x,
        coordinates.userCounter.y[i]
      );
    }

    // User Stats
    const wordsPerMinute = Math.floor(userData.serverXp / 6 / 60);
    const lettersPerPost = Math.floor(userData.serverXp / 1700);
    const stats = [wordsPerMinute.toString(), lettersPerPost.toString()];
    for (let i = 0; i < stats.length; i++) {
      ctx.fillText(
        stats[i],
        coordinates.userStats.x,
        coordinates.userStats.y[i]
      );
    }

    // Char related assets
    ctx.textAlign = "start";
    for (let index = 0; index < charAvatars.length; index++) {
      // Add character avatars corners and their images
      this._getRoundedCorner(
        ctx,
        coordinates.charAvatar.x,
        coordinates.charAvatar.y[index],
        dimensions.charAvatar,
        dimensions.charAvatar,
        shoulder,
        radius
      );
      ctx.drawImage(
        charAvatars[index],
        coordinates.charAvatar.x,
        coordinates.charAvatar.y[index],
        dimensions.charAvatar,
        dimensions.charAvatar
      );

      // Add character assets

      ctx.restore(); // This is mandatory. We need to restore the canvas to the original state after clipping. I do this one more time after the user avatar is drawn.
      ctx.drawImage(
        charSums[index],
        coordinates.charAsset.x[0],
        coordinates.charAsset.y[index],
        dimensions.charAssets,
        dimensions.charAssets
      );
      ctx.drawImage(
        charPhantoms[index],
        coordinates.charAsset.x[1],
        coordinates.charAsset.y[index],
        dimensions.charAssets,
        dimensions.charAssets
      );
      ctx.fillText(
        charNames[index],
        coordinates.charName.x,
        coordinates.charName.y[index]
      );
    }

    // Add radius to user avatar and its image.
    this._getRoundedCorner(
      ctx,
      coordinates.userAvatar.x,
      coordinates.userAvatar.y,
      dimensions.userAvatar,
      dimensions.userAvatar,
      shoulder,
      radius
    );
    ctx.drawImage(
      userAvatar,
      coordinates.userAvatar.x,
      coordinates.userAvatar.y,
      dimensions.userAvatar,
      dimensions.userAvatar
    );
    ctx.restore();

    // Build the attachment
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: `${user.username}_profile.png`,
    });
    return attachment;
  }

  private _fillWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
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
    ctx.save();
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
  private async _getExpPercentage(
    level: number,
    totalXp: number
  ): Promise<any> {
    //  the current level progress to the next level
    const currentXp =
      totalXp -
      Object.values(levels)
        .splice(0, level)
        .reduce((a, b) => a + b, 0);

    const fullBarWidth = 144;
    const requiredXp = levels[level + 1];
    const percentage = (currentXp / requiredXp) * fullBarWidth || 0;
    if (percentage > fullBarWidth) return fullBarWidth;
    return percentage;
  }
}
