import { CommandInteraction, Snowflake } from 'discord.js';
import { ArgsOf, GuardFunction } from 'discordx';

export function isAllowedParent(channels: Snowflake[]) {
  const guard: GuardFunction<
    ArgsOf<'messageCreate'> | CommandInteraction
  > = async (arg, _client, next) => {
    const argObj = arg instanceof Array ? arg[0] : arg;
    const channel = argObj.channel;
    if (channel.isDMBased()) return;

    if (channels.includes(channel?.parentId ?? '')) {
      await next();
    } else {
      if (arg instanceof CommandInteraction)
        return arg.reply({
          ephemeral: true,
          content: 'Você não pode usar esse comando aqui!',
        });
    }
  };
  return guard;
}
