import type { ArgsOf } from "discordx";
import { Discord, Guard, On } from "discordx";
import { BaseMessageOptions } from "discord.js";
import { CharEmbed, ErrorMessage } from "../../components";
import { hasCharacter, isAllowedParent } from "../../guards";
import { handleUserPost } from "../../../prisma";
import { Util } from "../../util/Util.js";
import { allowedRoleplayParents } from "../../resources";

@Discord()
export class Playcard {
  @On({ event: "messageCreate" })
  @Guard(hasCharacter, isAllowedParent(allowedRoleplayParents))
  public async post([message]: ArgsOf<"messageCreate">) {
    const embed = await new CharEmbed(message).post();
    const reply = {} as BaseMessageOptions;
    Util.handleAttachment(message, reply, embed);
    reply.embeds = [embed];
    const sentPostMessage = await message.channel.send(reply);
    await handleUserPost(message, sentPostMessage);
    if (message.deletable)
      await message
        .delete()
        .catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage));
  }
}
