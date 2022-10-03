import {BaseMessageOptions} from 'discord.js';
import type {ArgsOf} from 'discordx';
import {Discord, Guard, On} from 'discordx';

import {handleUserPost} from '../../../prisma';
import {CharEmbed, ErrorMessage} from '../../components';
import {hasCharacter, isAllowedParent} from '../../guards';
import {allowedRoleplayParents} from '../../resources';
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

    const embed = await new CharEmbed(message).post();
    if (!embed) return message.reply(ErrorMessage.DatabaseError);
    const reply = {} as BaseMessageOptions;
    Util.handleAttachment(message, reply, embed);
    const sentPostMessage = await message.channel.send(reply);
    await handleUserPost(message, sentPostMessage);
    if (message.deletable)
      await message.delete().catch(() => console.log(ErrorMessage.CouldNotDeleteUnknownMessage));
  }
}
