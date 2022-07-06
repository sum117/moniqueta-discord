import {Client} from 'discord.js';
import { loadEvents } from './util.js';
import { token } from './util.js';

const client = new Client({
  intents: 32767,
});


client.once("ready", async () => {
  loadEvents(client, [
    { once: true, name: "ready" },
    { name: "messageCreate" },
  ]);
  const channel = client.channels.cache.get("994256052923146250");
  const collection = await channel.messages.fetch();
  while (collection) {
    await channel.bulkDelete(collection);
  }
});

process.on("unhandledRejection", (e) => {
  console.log(e);
});

client.login(token);
