import {
  Message,
  ReplyMessageOptions,
  EmbedBuilder,
  userMention,
} from 'discord.js';

export class Util {
  public static handleAttachment(
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
    if (message.mentions.users) {
      const mentions = message.mentions.users.map((user) =>
        userMention(user.id),
      );
      reply.content = mentions.join(',');
    }
  }
}
