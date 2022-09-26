import { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { ArgsOf, GuardFunction } from "discordx";
import { ErrorMessage } from "#util/ErrorMessage";

export const isAdmin: GuardFunction<
  ArgsOf<"messageCreate"> | CommandInteraction | ButtonInteraction
> = async (arg, _client, next) => {
  const argObj = arg instanceof Array ? arg[0] : arg;
  const hasAdminPrivileges =
    argObj instanceof Message
      ? argObj.member?.permissions.has("Administrator")
      : argObj.memberPermissions?.has("Administrator");
  if (hasAdminPrivileges) {
    await next();
  } else {
    const isSlashCommand = argObj instanceof CommandInteraction;
    if (isSlashCommand)
      return argObj[argObj.deferred ? "editReply" : "reply"]({
        ephemeral: true,
        content: ErrorMessage.NotAdmin,
      });
    return argObj.reply(ErrorMessage.NotAdmin);
  }
};
