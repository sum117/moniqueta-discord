const fs = require("fs");
const { join } = require("path");
const Discord = require("discord.js");
const prefix = process.env["prefix"];

module.exports = {
  /**
   * @description Inicializa os eventos necessários para o funcionamento dos comandos.
   * @param {Discord.Client} client O cliente do bot.
   * @param {Array<{name: String, once: Boolean}>} events os eventos que serão utilizados pelo bot.
   */
  loadEvents(client, events = [{ name: "", once: false }]) {
    events.map(({ name, once }) => {
      if (once) client.once(name, (...args) => loadCommands(name, ...args));
      else client.on(name, (...args) => loadCommands(name, ...args));
    });
  },

  /**
   * @description Coloca uma palavra em modo título.
   * @param {String} string Uma palavra para ter sua primeira letra capitalizada.
   * @returns {String} Título
   */
  title(string = "") {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
};

/**
 * @description Roda os comandos do bot. Deve ser colocado nos eventos.
 * @param {String} event O nome do evento que executou este comando.
 * @param {Array} ...args Os argumentos do evento. Variam de um para outro.
 */
function loadCommands(event, ...args) {
  const path = join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(path)
    .filter((file) => file.endsWith(".js"));

  if (event === "messageCreate") {
    /**
     * @type {Discord.Message}
     * @constant msg A mensagem recebida no evento.
     */
    const msg = args[0];

    if (msg.content.startsWith(prefix)) {
      const arguments = msg.content.slice(1).split(/ +/);
      const name = arguments[0];
      const command = commandFiles.find((e) => e === `${name}.js`);
      if (command) require(`${path}/${command}`).execute(msg, arguments);
      else msg.reply("❌ Não encontrei o comando que você tentou executar.");
    }
    const prefixlessPath = join(__dirname, "commands", "prefixless");
    fs.readdirSync(prefixlessPath)
      .filter((file) => file.endsWith(".js"))
      .forEach((file) => {
        const command = require(`${prefixlessPath}/${file}`);
        command.execute(msg);
      });
  }
}
