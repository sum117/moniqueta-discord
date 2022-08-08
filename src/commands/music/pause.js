export const data = {
  name: 'pause',
  kind: 'music',
  description: 'Pause a música!'
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({
      content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'
    });
  }
  const success = queue.setPaused(true);
  return void interaction.followUp({
    content: success ? '⏸ | Pausei!' : '❌ Eu... buguei aí!'
  });
}
