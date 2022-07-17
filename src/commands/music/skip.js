export const data = {
  name: 'skip',
  description: 'Passe uma música!',
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'});
  }
  const currentTrack = queue.current;
  const success = queue.skip();
  return void interaction.followUp({
    content: success ? `✅ Passado é passado! **${currentTrack}**!` : '❌ Eu... buguei!',
  });
}
