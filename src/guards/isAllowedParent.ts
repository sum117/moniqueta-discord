import {CommandInteraction, Snowflake, TextChannel} from "discord.js";
import {ArgsOf, GuardFunction} from "discordx";
import {ErrorMessage} from "../util/ErrorMessage";

export function isAllowedParent(channels: Snowflake[]) {
    const guard: GuardFunction<ArgsOf<"messageCreate"> | CommandInteraction> = async (arg, _client, next) => {
        const argObj = arg instanceof Array ? arg[0] : arg;
        const channel = argObj.channel;
        if (!(channel instanceof TextChannel) || channel.isDMBased()) return;
        if (channels.includes(channel.parentId ?? "")) {
            await next();
        } else {
            if (arg instanceof CommandInteraction)
                return arg.reply({
                    ephemeral: true,
                    content: ErrorMessage.NotAllowedParent,
                });
        }
    };
    return guard;
}
