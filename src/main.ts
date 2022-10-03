import 'reflect-metadata';
import 'dotenv/config';

import {dirname, importx} from '@discordx/importer';
import {codeBlock, Interaction, Message} from 'discord.js';
import {IntentsBitField} from 'discord.js';
import {Client} from 'discordx';

import {isNotBot} from './guards';
import { requiredConfigChannels } from './resources';

export const bot = new Client({
  // To only use global commands (use @Guild for specific guild command), comment this line
  botGuilds: [client => client.guilds.cache.map(guild => guild.id)],
  guards: [isNotBot],
  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: '!'
  }
});

bot.once('ready', async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log('Bot started');
});

bot.on('interactionCreate', (interaction: Interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith('discordx@pagination')) return;
  if (interaction.isModalSubmit()) {
    bot.executeInteraction(interaction);
    return;
  }
  bot.executeInteraction(interaction);
});

bot.on('messageCreate', (message: Message) => {
  bot.executeCommand(message);
});


bot.on('error', (err) => {
  handleBotErrors(err);
})
process.on('unhandledRejection', (err: Error) => {
  handleBotErrors(err);
});

function handleBotErrors(err: Error) {
  const errorChannel = bot.channels.cache.get(requiredConfigChannels.errorLogChannel);
  console.log(err);
  if (errorChannel && errorChannel.isTextBased()) {
    const errorString = `${err?.name}: ${err?.message}\n${err?.stack}`;
    if (errorString.length > 2000) {
      errorChannel.send({
        files: [{ attachment: Buffer.from(errorString), name: 'stack.txt' }]
      });
    }
    errorChannel.send({
      content: codeBlock('ts', errorString),
    });
  }
}

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment');
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);
}

run();
