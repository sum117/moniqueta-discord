import {BaseMessageOptions} from 'discord.js';
import type {ArgsOf} from 'discordx';
import {Discord, Guard, On} from 'discordx';

import {handleUserPost, isUserFreeStyling} from '../../../prisma';
import {CharEmbed} from '../../components';
import {hasCharacter, isAllowedParent} from '../../guards';
import {allowedRoleplayParents} from '../../resources';
import {ErrorMessage} from '../../util/ErrorMessage.js';
import {Util} from '../../util/Util.js';

@Discord()
export class Playcard {
  @On({event: 'messageCreate'})
  @Guard(hasCharacter, isAllowedParent(allowedRoleplayParents))
  public async post([message]: ArgsOf<'messageCreate'>) {
    const oocBrackets = /^[\\/()[\]]/g;
    const deletionTime = 60 * 5 * 1000;
    if (message.content.match(oocBrackets))
      return setTimeout(
        () => message.delete().catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage)),
        deletionTime
      );
    const charEmbed = new CharEmbed(message);
    // Free Styling
    if (await isUserFreeStyling(message.author.id)) {
      const replyArray = await charEmbed.multiPost(message);
      if (replyArray)
        return new Promise(async (resolve, reject): Promise<void> => {
          for (let i = 0; i < replyArray.length; i++) {
            const reply = await replyArray[i];
            if (reply) {
              const replyMessage = await message.channel.send(reply);
              await handleUserPost(message, replyMessage);
            } else {
              reject;
              break;
            }
            if (i === replyArray.length - 1) {
              resolve;
              break;
            }
          }
        });
      else
        return message
          .reply(ErrorMessage.ForgotPrefix)
          .then(msg =>
            setTimeout(
              () => msg.delete().catch(() => console.log(ErrorMessage.UnknownMessage)),
              deletionTime
            )
          );
    }
    // Normal Posting
    const embed = await charEmbed.post();
    if (!embed) return message.reply(ErrorMessage.DatabaseError);
    const reply = {} as BaseMessageOptions;
    Util.handleAttachment(message, reply, embed);
    const sentPostMessage = await message.channel.send(reply);
    await handleUserPost(message, sentPostMessage);
    await message.delete().catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage));
  }
}
