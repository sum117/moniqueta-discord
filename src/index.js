const { Client } = require("discord.js");
const client = new Client({ intents: 32767 });
exports.client = client;
const token = process.env["token"];
const util = require("./util.js");

client.guilds.fetch().then((guilds) => {
    const gNames = guilds.map((g) => g.name).join(",");
    util.loadEvents(client, [{ once: true, name: 'ready' }, { name: 'messageCreate' }]);
    console.log("Bot iniciado com sucesso.\nServidores: " + gNames);
});

process.on("unhandledRejection", (e) => {
    console.log(e);
});

client.login(token);
