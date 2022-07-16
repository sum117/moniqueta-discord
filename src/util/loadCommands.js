import { prefix } from "./misc.js";
import { moniqueta } from "../index.js";
import * as slashCommands from "../commands/slash";
import * as interactionCommands from "../commands/interaction";
import * as prefixlessCommands from "../commands/prefixless";
import * as prefixCommands from "../commands/prefix";
import * as commandSystems from "../commands/systems";

const slash = Object(slashCommands);
const interactions = Object(interactionCommands);
const prefixless = Object(prefixlessCommands);
const prefixed = Object(prefixCommands);
const systems = Object(commandSystems);

export async function loadCommands(event, client, ...args) {
  switch (event) {
    case "messageCreate":
      const msg = args[0];
      if (msg.content.startsWith(prefix)) {
        const userArgs = msg.content.slice(1).trim().split(/ +/);
        const name = userArgs[0].toLowerCase();
        const command = prefixed[name];
        args.shift();
        if (command) {
          await command.execute(msg, userArgs);
        } else
          msg.reply("❌ Não encontrei o comando que você tentou executar.");
      }
      for (const [, command] of Object.entries(prefixless)) {
        command.execute(client, msg);
      }
      break;
    case "interactionCreate":
      const interaction = args[0];
      if (interaction.isCommand())
        await slash[interaction.commandName].execute(interaction, client);
      else
        for (const command in interactions) {
          if (interactions[command].event === event)
            await interactions[command].execute(interaction, client);
        }
      break;
    default:
      for (const [, system] of Object.entries(systems)) {
        if (system.data.events.includes(event))
          await system.execute(event, client, ...args);
      }
  }
}
