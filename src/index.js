import { Client } from "discord.js";
import { loadEvents, registerSlashCommands } from "./util.js";
import { token } from "./util.js";

const moniqueta = new Client({
  intents: 32767,
});

moniqueta.once("ready", async () => {
  console.log("Moniqueta pronta.");

  const sDAGuild = moniqueta.guilds.cache.get("976870103125733388");
  registerSlashCommands(moniqueta, sDAGuild.id);
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
