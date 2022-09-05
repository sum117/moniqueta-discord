import { Snowflake } from 'discord.js';
import { ArgsOf, GuardFunction } from 'discordx';

export function isAllowedParent(channels: Snowflake[]) {
  const guard: GuardFunction<ArgsOf<'messageCreate'>> = async (
    arg,
    _client,
    next,
  ) => {
    const argObj = arg instanceof Array ? arg[0] : arg;
    const channel = argObj.channel;
    if (channel.isDMBased()) return;
    if (channels.includes(channel?.parentId ?? '')) {
      await next();
    }
  };
  return guard;
}
