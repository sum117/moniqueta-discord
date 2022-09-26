import { CommandInteraction } from "discord.js";
import { ArgsOf, GuardFunction } from "discordx";
import { getCurrentChar } from "../../prisma";

export const hasCharacter: GuardFunction<
  ArgsOf<"messageCreate"> | CommandInteraction
> = async (arg, _client, next) => {
  const argObj = arg instanceof Array ? arg[0] : arg;
  const char = await getCurrentChar(argObj);
  if (char) await next();
};
