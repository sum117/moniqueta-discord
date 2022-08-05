export const data = {
  name: 'remove',
  type: 'music',
  description: 'Remova uma música da lista!',
  options: [
    {
      name: 'number',
      type: 4, // 'INTEGER' Type
      description: 'O número da música da lista que você quer remover.',
      required: true
    }
  ]
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'});
  }
  const number = interaction.options.get('number').value - 1;
  if (number > queue.tracks.length) {
    return void interaction.followUp({content: '❌ O número que você falou é maior do que o tamanho da fila!'});
  }
  const removedTrack = queue.remove(number);
  return void interaction.followUp({
    content: removedTrack ? `✅ Removi **${removedTrack}**!` : '❌ Hehe... algo... deu errado, e eu buguei...'
  });
}
