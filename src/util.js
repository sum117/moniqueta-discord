import fs from "fs";
import { Client, Message, Interaction } from "discord.js";
export const prefix = process.env.PREFIX

export const token = process.env.TOKEN

/**
 * @description Inicializa os eventos necessários para o funcionamento dos comandos.
 * @param {Client} client O cliente do bot.
 * @param {Array<{name: String, once: Boolean}>} events os eventos que serão utilizados pelo bot.
 */
export async function loadEvents(client, events = [{ name: "", once: false }]) {
  events.map(({ name, once }) => {
    if (once) client.once(name, (...args) => loadCommands(name, ...args));
    else client.on(name, (...args) => loadCommands(name, ...args));
  });
}

/**
 * @description Coloca uma palavra em modo título.
 * @param {String} string Uma palavra para ter sua primeira letra capitalizada.
 * @returns {String} Título
 */
export function title(string = "") {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * @author Milo123459<https://github.com/Milo123459>
 * @description This progress bar logic was copied from <https://github.com/Sparker-99/string-progressbar/blob/master/index.js>, a NPM package by Sparker-99.
 */
export function statusBar(current, total, fill, empty) {
  let percentage = current / total;
  let progress = Math.round(5 * percentage);
  let emptyProgress = 5 - progress;
  let progressText = fill.repeat(progress);
  let emptyProgressText = empty.repeat(emptyProgress);
  let bar = progressText + emptyProgressText;
  return `${bar}`;
}
/**@param {Client} client - Um cliente do Discord */
export async function registerSlashCommands(client, guildId) {
  fs.readdirSync("src/commands")
    .filter((file) => file.startsWith("slash."))
    .forEach(async (file) => {
      const slashCommand = (
        await import("./commands/" + file)
      ).default.data.toJSON();
      client.application.commands.set([])
      await (await client.guilds.fetch(guildId)).commands.set([slashCommand])
    });
}
/**
 * @description Roda os comandos do bot. Deve ser colocado nos eventos.
 * @param {String} event O nome do evento que executou este comando.
 * @param {Array} ...args Os argumentos do evento. Variam de um para outro.
 */
async function loadCommands(event, ...args) {
  const commandFiles = fs
    .readdirSync("src/commands")
    .filter((file) => file.endsWith(".js"));

  switch (event) {
    case "messageCreate":
      /**
       * @type {Message}
       * @constant msg A mensagem recebida no evento.
       */
      const msg = args[0];

      if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(1).split(/ +/);
        const name = args[0];
        const command = commandFiles.find((e) => e === `${name}.js`);
        if (command)
          (await import("./commands/" + command)).default.execute(msg, args);
        else msg.reply("❌ Não encontrei o comando que você tentou executar.");
      }
      fs.readdirSync("src/commands/prefixless")
        .filter((file) => file.endsWith(".js"))
        .forEach(async (file) => {
          (await import("./commands/prefixless/" + file)).default.execute(msg);
        });
      break;
    case "interactionCreate":
      /**
       * @type {Interaction}
       * @constant interaction Interação recebida no evento.
       */
      const interaction = args[0];
      let file;
      if (interaction.isCommand())
        file = commandFiles.find(
          (command) => command === `interaction.${interaction.commandName}.js`
        );
      else
        file = commandFiles.find((action) =>
          action.startsWith(`interaction.${interaction.customId}`)
        );
      if (!file) return
      (await import("./commands/" + file)).default.execute(...args);
      break;
  }
}
