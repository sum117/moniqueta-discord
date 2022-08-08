export const data = {
  name: 'resume',
  kind: 'music',
  description: 'Continuemos a tocar o que paramos!'
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({
      content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'
    });
  }
  const success = queue.setPaused(false);
  return void interaction.followUp({
    content: success ? '▶  Resumi!' : 'Hehe, não consegui resumir, buguei!'
  });
}
