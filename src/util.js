import fs from 'fs';
import { Client, Message, Interaction } from 'discord.js';
import { moniqueta } from './index.js';
// BOT STARTUP CREDENTIALS

export const [prefix, token] = await import('./config.json', {
  assert: { type: 'json' },
})
  .then((config) => {
    console.log('Using config.json file for the startup.');
    return [config.default.PREFIX, config.default.TOKEN];
  })
  .catch(() => {
    console.log('Using environment variables.');
    return [process.env.PREFIX, process.env.TOKEN];
  });

// SPECIFIC CHANNEL IDS FOR GUILD COMMANDS
export const categories = {
  arquivo: '977086756459511808',
};
export const channels = {
  rpRegistro: '977090435845603379',
  adminFichaRegistro: '986952888930697266',
  rpFichas: '986952888930697266',
};
const commandFiles = fs
  .readdirSync('src/commands')
  .filter((file) => file.endsWith('.js'));
/**
 * @description Inicializa os eventos necessários para o funcionamento dos comandos.
 * @param {Client} client O cliente do bot.
 * @param {Array<{name: String, once: Boolean}>} events os eventos que serão utilizados pelo bot.
 */
export async function loadEvents(client, events = [{ name: '', once: false }]) {
  commandFiles.map(async (file) => {
    if (file.startsWith('slash.') || file.startsWith('interaction.')) return;
    const command = (await import('./commands/' + file)).default;
    return moniqueta.commands.set(file.split('.')[0], {
      name: command.name,
      description: command.description,
    });
  });
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
export function title(string = '') {
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
  const slashArray = fs
    .readdirSync('src/commands')
    .filter((file) => file.startsWith('slash.'))
    .map(async (file) => {
      return (await import('./commands/' + file)).default.data.toJSON();
    });
  const slashCommands = await Promise.all(slashArray);
  await client.application.commands.set(slashCommands, guildId);
}
/**
 * @description Roda os comandos do bot. Deve ser colocado nos eventos.
 * @param {String} event O nome do evento que executou este comando.
 * @param {Array} args Os argumentos do evento. Variam de um para outro.
 */
async function loadCommands(event, ...args) {
  // Operação para o comando de ajuda.
  switch (event) {
    case 'messageCreate':
      /**
       * @type {Message}
       * @constant msg A mensagem recebida no evento.
       */
      const msg = args[0];

      if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(1).trim().split(/ +/);
        const name = args[0];
        const command = commandFiles.find((e) => e === `${name}.js`);
        args.shift();
        if (command)
          (await import('./commands/' + command)).default.execute(msg, args);
        else msg.reply('❌ Não encontrei o comando que você tentou executar.');
      }
      fs.readdirSync('src/commands/prefixless')
        .filter((file) => file.endsWith('.js'))
        .forEach(async (file) => {
          (await import('./commands/prefixless/' + file)).default.execute(msg);
        });
      break;
    case 'interactionCreate':
      /**
       * @type {Interaction}
       * @constant interaction Interação recebida no evento.
       */
      const interaction = args[0];
      let files;
      if (interaction.isCommand())
        files = [
          commandFiles.find(
            (command) => command === `slash.${interaction.commandName}.js`,
          ),
        ];
      else
        files = commandFiles.filter((action) =>
          action.startsWith('interaction.'),
        );
      if (!files) return;
      files.forEach(async (file) =>
        (await import('./commands/' + file)).default.execute(...args),
      );
      break;
  }
}
