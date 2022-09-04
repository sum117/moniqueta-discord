import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Interaction
} from 'discord.js';
import {title} from '../../util/index.js';
import {db} from '../../db.js';
import {assets} from '../../structures/SDA/PlayCardBase.js';

export const data = {
  event: 'interactionCreate',
  name: 'Ciclar entre os personagens.',
  description:
    'Gera uma lista de personagens para o usuário clicar e ver as páginas.'
};

/**
 *
 * @param {Interaction} interaction
 */
export async function execute(interaction) {
  if (interaction.customId.split('.')[0] !== 'list') return;
  const target = await interaction.guild.members.fetch({
    user: interaction.customId.split('.')[1]
  });

  const characters = await db.get(`${target.id}.chars`);
  const displayCharacter = characters[interaction.customId.split('.')[2]];

  const possibleIndexes = Object.keys(characters);
  const index = possibleIndexes.findIndex(i => i === displayCharacter.id);
  const nextIndex = possibleIndexes[index + 1] || possibleIndexes[0];
  const previousIndex =
    possibleIndexes[index - 1] || possibleIndexes[possibleIndexes.length - 1];

  if (!displayCharacter)
    return interaction.reply({
      content: 'Personagem não encontrado.',
      ephemeral: true
    });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`list.${target.id}.${previousIndex}`)
      .setLabel('⬅️')
      .setStyle('Primary'),

    new ButtonBuilder()
      .setCustomId(`list.${target.id}.${nextIndex}`)
      .setLabel('➡️')
      .setStyle('Primary')
  );
  const embed = new EmbedBuilder()
    .setAuthor({
      name: 'Personagens de ' + title(target.user.username),
      iconURL: target.user.displayAvatarURL()
    })
    .setColor(assets.sum[displayCharacter.sum].color)
    .setDescription(displayCharacter.appearance)
    .setImage(displayCharacter.avatar)
    .setFooter({
      text: 'Este personagem pertence à ordem ' + title(displayCharacter.sum)
    })
    .setTitle(displayCharacter.name);
  interaction.update({embeds: [embed], components: [buttons]});
}