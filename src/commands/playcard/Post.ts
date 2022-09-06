import { On, Discord, Guard } from 'discordx';
import type { ArgsOf } from 'discordx';
import { ReplyMessageOptions } from 'discord.js';
import { CharEmbed } from '../../components';
import { isAllowedParent, hasCharacter } from '../../guards';
import { handleUserPost } from '../../../prisma';
import { Util } from '../../util/Util.js';
@Discord()
export class Post {
  @On({ event: 'messageCreate' })
  @Guard(hasCharacter, isAllowedParent(['1016689271207383102']))
  public async createPost([message]: ArgsOf<'messageCreate'>) {
    const embed = await new CharEmbed(message).post();
    const reply = {} as ReplyMessageOptions;
    Util.handleAttachment(message, reply, embed);
    reply.embeds = [embed];
    const sentPostMessage = await message.channel.send(reply);
    await handleUserPost(message, sentPostMessage);
    try {
      await message.delete();
    } catch {
      return;
    }
  }
}
