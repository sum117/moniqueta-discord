export const data = {
  name: 'volume',
  type: 'music',
  description: 'Mude o volume!',
  options: [
    {
      name: 'volume',
      type: 4, // 'INTEGER' Type
      description: 'Número entre 0 e 200',
      required: true
    }
  ]
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({
      content: '❌ | No music is being played!'
    });
  }

  let volume = interaction.options.get('volume').value;
  volume = Math.max(0, volume);
  volume = Math.min(200, volume);
  const success = queue.setVolume(volume);

  return void interaction.followUp({
    content: success ? `🔊 Mudei o volume para ${volume}!` : '❌ Não deu, vai ficar surdo (Eu buguei)!'
  });
}
