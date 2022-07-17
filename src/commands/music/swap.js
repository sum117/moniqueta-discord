export const data = {
  name: 'swap',
  description: 'Troque as posições das músicas!',
  options: [
    {
      name: 'track1',
      type: 4, // 'INTEGER' Type
      description: 'Essa',
      required: true,
    },
    {
      name: 'track2',
      type: 4, // 'INTEGER' Type
      description: 'Por essa',
      required: true,
    },
  ],
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'});
  }
  const queueNumbers = [interaction.options.get('track1').value - 1, interaction.options.get('track2').value - 1];
  // Sort so the lowest number is first for swap logic to work
  queueNumbers.sort(function (a, b) {
    return a - b;
  });
  if (queueNumbers[1] > queue.tracks.length) {
    return void interaction.followUp({
      content: '❌ O número que você especificou é maior do que o tamanho da minha fila!',
    });
  }

  try {
    const track2 = queue.remove(queueNumbers[1]); // Remove higher track first to avoid list order issues
    const track1 = queue.remove(queueNumbers[0]);
    queue.insert(track2, queueNumbers[0]); // Add track in lowest position first to avoid list order issues
    queue.insert(track1, queueNumbers[1]);
    return void interaction.followUp({
      content: `✅ | Swapped **${track1}** & **${track2}**!`,
    });
  } catch (error) {
    console.log(error);
    return void interaction.followUp({
      content: '❌ Hehe... eu buguei!',
    });
  }
}
