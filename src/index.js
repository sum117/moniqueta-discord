const { Client} = require("discord.js");
const client = new Client({
  intents: 32767,
});
const token = process.env["token"];
const util = require("./util.js");

client.once("ready", async () => {
  util.loadEvents(client, [
    { once: true, name: "ready" },
    { name: "messageCreate" },
  ]);
  const channel = client.channels.cache.get("994256052923146250");
  const collection = await channel.messages.fetch();
  while (collection) {
    await channel.bulkDelete(collection, { limit: 10 });
  }
});

process.on("unhandledRejection", (e) => {
  console.log(e);
});

client.login(token);
