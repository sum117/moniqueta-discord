import {CommandInteraction, Snowflake, TextChannel, ThreadChannel} from 'discord.js';
import {ArgsOf, GuardFunction} from 'discordx';

import {ErrorMessage} from '../util/ErrorMessage';

export function isAllowedParent(channels: Snowflake[]) {
  const guard: GuardFunction<ArgsOf<'messageCreate'> | CommandInteraction> = async (
    arg,
    _client,
    next
  ) => {
    const argObj = arg instanceof Array ? arg[0] : arg;
    const channel = argObj.channel;
    if (channel instanceof ThreadChannel) {
      // Check if ThreadChannel belongs to channel in allowedParents array
      const hostChannel = channel.parent;
      // if it belongs return pass otherwise void
      if (hostChannel?.isTextBased() && channels.includes(hostChannel?.parentId ?? ''))
        return next();
      return;
    }
    if (!channel?.isTextBased() || channel.isDMBased()) return;
    if (channels.includes(channel.parentId ?? '')) {
      await next();
    } else {
      if (arg instanceof CommandInteraction)
        return arg.reply({
          ephemeral: true,
          content: ErrorMessage.NotAllowedParent
        });
    }
  };
  return guard;
}
