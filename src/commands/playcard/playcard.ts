import { On, Discord, Guard, GuardFunction } from 'discordx';
import type { ArgsOf } from 'discordx';
import { CharEmbed } from '../../components/index.js';
import { ReplyMessageOptions } from 'discord.js';
const isOwner: GuardFunction<ArgsOf<'messageCreate'>> = async (
  [message],
  _client,
  next,
) => {
  if (
    ['969062359442280548', '423574776036982784'].includes(message.author.id)
  ) {
    await next();
  }
};
@Discord()
export class PlayCard {
  @On({ event: 'messageCreate' })
  @Guard(isOwner)
  async createPost([message]: ArgsOf<'messageCreate'>) {
    const embed = await new CharEmbed(message).post();
    const reply = {} as ReplyMessageOptions;
    if (message.attachments.first()) {
      const attachmentName = message.attachments.first().url.split('/').pop();
      embed.setImage('attachment://' + attachmentName);
      reply.embeds = [embed];
      reply.files = [
        {
          attachment: message.attachments.first().attachment,
          name: attachmentName,
        },
      ];
    }
    reply.embeds = [embed];
    await message.channel.send(reply);
    return message.delete().catch((err) => console.log(err));
  }
}
