export const data = {
  name: 'move',
  kind: 'music',
  description: 'Mova uma música de posição na fila!',
  options: [
    {
      name: 'track',
      type: 4, // 'INTEGER' Type
      description: 'O número da música que você quer mover',
      required: true
    },
    {
      name: 'position',
      type: 4, // 'INTEGER' Type
      description: 'A posição que você quer que a música seja movida para',
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
  const queueNumbers = [interaction.options.get('track').value - 1, interaction.options.get('position').value - 1];
  if (queueNumbers[0] > queue.tracks.length || queueNumbers[1] > queue.tracks.length) {
    return void interaction.followUp({
      content:
        '🦝 O número especificado é maior do que a quantia de músicas na minha lista. O que você tá tentando fazer?'
    });
  }

  try {
    const track = queue.remove(queueNumbers[0]);
    queue.insert(track, queueNumbers[1]);
    return void interaction.followUp({
      content: `✅ Movi **${track}**!`
    });
  } catch (error) {
    console.log(error);
    return void interaction.followUp({
      content: 'Me desculpa, eu... eu dei erro!'
    });
  }
}
