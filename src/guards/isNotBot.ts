import {
  ButtonInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  MessageReaction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  VoiceState,
} from "discord.js";
import { ArgsOf, GuardFunction, SimpleCommandMessage } from "discordx";

// Example by @AndyClausen
// Modified by @oceanroleplay

export const isNotBot: GuardFunction<
  | ArgsOf<"messageCreate" | "messageReactionAdd" | "voiceStateUpdate">
  | CommandInteraction
  | ContextMenuCommandInteraction
  | SelectMenuInteraction
  | ButtonInteraction
  | SimpleCommandMessage
> = async (arg, _client, next, guardData) => {
  const argObj = arg instanceof Array ? arg[0] : arg;
  const user =
    argObj instanceof CommandInteraction
      ? argObj.user
      : argObj instanceof MessageReaction
      ? argObj.message.author
      : argObj instanceof VoiceState
      ? argObj.member?.user
      : argObj instanceof Message
      ? argObj.author
      : argObj instanceof SimpleCommandMessage
      ? argObj.message.author
      : argObj instanceof CommandInteraction ||
        argObj instanceof ContextMenuCommandInteraction ||
        argObj instanceof SelectMenuInteraction ||
        argObj instanceof ModalSubmitInteraction ||
        argObj instanceof ButtonInteraction
      ? argObj.member?.user
      : argObj.message.author;
  if (!user?.bot) {
    guardData.message = "the NotBot guard passed";
    await next();
  }
};
