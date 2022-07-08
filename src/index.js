import { Client } from "discord.js";
import { loadEvents, registerSlashCommands } from "./util.js";
import { token } from "./util.js";

const moniqueta = new Client({
  intents: 32767,
});

moniqueta.once("ready", async () => {
  console.log("Moniqueta pronta.");

  const myGuild = "976870103125733388";
  registerSlashCommands(moniqueta, myGuild);
  loadEvents(moniqueta, [
    { once: true, name: "ready" },
    { name: "messageCreate" },
    { name: "interactionCreate" },
  ]);
});

process.on("unhandledRejection", (e) => {
  console.log(e);
});

moniqueta.login(token);
