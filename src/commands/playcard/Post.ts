import { On, Discord, Guard } from 'discordx';
import type { ArgsOf } from 'discordx';
import type { EmbedBuilder, Message } from 'discord.js';
import { CharEmbed } from '../../components';
import { ReplyMessageOptions } from 'discord.js';
import { isAllowedParent } from '../../guards';

@Discord()
export class Post {
  @On({ event: 'messageCreate' })
  @Guard(isAllowedParent)
  async createPost([message]: ArgsOf<'messageCreate'>) {
    const embed = await new CharEmbed(message).post();
    const reply = {} as ReplyMessageOptions;
    this._handleAttachment(message, reply, embed);
    reply.embeds = [embed];
    await message.channel.send(reply);
    return message.delete().catch((err) => console.log(err));
  }
  public _handleAttachment(
    message: Message,
    reply: ReplyMessageOptions,
    embed: EmbedBuilder,
  ) {
    const attachment = message.attachments.first();
    if (attachment) {
      const attachmentName = attachment.url.split('/').pop();
      embed.setImage('attachment://' + attachmentName);
      reply.embeds = [embed];
      reply.files = [
        {
          attachment: attachment.attachment,
          name: attachmentName,
        },
      ];
    }
  }
}
