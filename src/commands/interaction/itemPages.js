import {db} from '../../db.js';
import {
  bold,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import {title} from '../../util';
export const data = {
  event: 'interactionCreate',
  name: 'Ciclar entre os itens.',
  description: 'Gera uma lista de itens para o usuário clicar e ver as páginas.'
};

export async function execute(interaction) {
  if (!interaction.customId.startsWith('item.listar')) return;
  const groupByN = (n, data) => {
    let result = [];
    for (let i = 0; i < data.length; i += n) result.push(data.slice(i, i + n));
    return result;
  };
  let itens = await db.table('server_items').all();
  itens = itens.map(item => `ID ${bold(item.id)}: ${title(item.value.nome)}`);
  itens = groupByN(10, itens);
  let currentPage = parseInt(interaction.customId?.split('.')?.[2]) ?? 0;
  let nextPage = itens?.[currentPage + 1] ? currentPage + 1 : 0;
  let previousPage = itens?.[currentPage - 1]
    ? currentPage - 1
    : itens.length - 1;

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`item.listar.${previousPage}`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji('⬅️'),
    new ButtonBuilder()
      .setCustomId(`item.listar.${nextPage}`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji('➡️')
  );

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `🎒 Itens do ${interaction.guild.name} 🎒`
    })
    .setDescription(itens[currentPage].join('\n'))
    .setFooter({
      text: `Página ${currentPage + 1} de ${itens.length}`
    });
  return interaction.update({
    embeds: [embed],
    components: [buttons]
  });
}
