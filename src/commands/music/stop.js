export const data = {
  name: 'stop',
  description: 'Pare todas as músicas!',
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({
      content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!',
    });
  }
  queue.destroy();
  return void interaction.followUp({content: '🛑 Tá bom, tá bom! Já parei... nossa.'});
}
