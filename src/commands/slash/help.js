import { Collection, Interaction, MessageEmbed } from 'discord.js';
import { inlineCode, bold } from '@discordjs/builders';
import { SlashCommandBuilder } from '@discordjs/builders';
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Mostra todos os comandos disponíveis na moniqueta.');

/**
 * @param {Interaction} interaction
 */
export async function execute(interaction, client) {
  const moniqueta = client;
  /**
   * @type {Collection}
   * @constant commands - Uma coleção do Discord com os comandos do bot.
   */
  const commands = moniqueta.commands;
  const owner = await interaction.guild.fetchOwner();
  const embed = new MessageEmbed()
    .setDescription(
      '💡 Possuo diversas integrações de Slash Commands além desta que você pode checar escrevendo `/`!\n\n' +
      commands
        .map((description, command) => inlineCode(moniqueta.prefix + command) + ' ' + bold(description))
        .join('\n'),
    )
    .setColor(12340060)
    .setTitle('Meus Comandos~')
    .setThumbnail(moniqueta.user.avatarURL({ dynamic: true, size: 1024 }))
    .setAuthor({
      name: 'sum117 <-- Meu criador 👀',
      iconURL: owner.user.avatarURL({ dynamic: true, size: 512 }),
    })
    .setFooter({
      text: '💘 Eu estou em construção, tenha paciência!',
    });
  const embed2 = embed
    .setAuthor(null)
    .setTitle('🎶 Comandos de Música')
    .setFooter(null)
    .setThumbnail(null)
    .setDescription(
      commands
        .map((description, command) => inlineCode(moniqueta.prefix + command) + ' ' + bold(description))
        .join('\n'),
    );
  console.log(embed2)
  return interaction.reply({
    content: 'Todos os comandos atualmente disponíveis em mim: ',
    embeds: [embed, embed2],
  });
}
