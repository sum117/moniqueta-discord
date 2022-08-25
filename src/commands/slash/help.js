import {bold, inlineCode} from '@discordjs/builders';
import {SlashCommandBuilder} from '@discordjs/builders';
import { EmbedBuilder} from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Mostra todos os comandos disponíveis na moniqueta.');

/**
 * @param {CommandInteraction} interaction
 */
export async function execute(interaction, client) {
  const moniqueta = client;
  /**
   * @type {Collection}
   * @constant commands - Uma coleção do Discord com os comandos do bot.
   */
  const commands = moniqueta.commands;
  const owner = await interaction.guild.fetchOwner();
  const embed = new EmbedBuilder()
    .setDescription(
      bold('Comandos de Barra') +
        '\n\n' +
        commands
          .filter(([, type]) => !type)
          .map(([description], command) => inlineCode('/' + command) + ' ' + bold(description))
          .join('\n') +
        '\n\n' +
        bold('Comandos de Prefixo') +
        '\n\n' +
        commands
          .filter(([, type]) => {
            if (!type) return false;
            return true;
          })
          .map(([description], command) => inlineCode(moniqueta.prefix + command) + ' ' + bold(description))
          .join('\n')
    )
    .setColor(12340060)
    .setTitle('Meus Comandos~')
    .setThumbnail(moniqueta.user.avatarURL({dynamic: true, size: 1024}))
    .setAuthor({
      name: 'sum117 <-- Meu criador 👀',
      iconURL: owner.user.avatarURL({dynamic: true, size: 512})
    })
    .setFooter({
      text: '💘 Eu estou em construção, tenha paciência!'
    });
  return await interaction.reply({
    content: 'Todos os comandos atualmente disponíveis em mim: ',
    embeds: [embed]
  });
}
