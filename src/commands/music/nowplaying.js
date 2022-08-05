export const data = {
  name: 'nowplaying',
  type: 'music',
  description: 'Saiba o som que estou tocando no momento.'
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({
      content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'
    });
  }
  const progress = queue.createProgressBar();
  const perc = queue.getPlayerTimestamp();

  return void interaction.followUp({
    embeds: [
      {
        title: '💘 Agora tocando ~',
        description: `🎶 | **${queue.current.title}**! (\`${perc.progress}%\`)`,
        fields: [
          {
            name: '\u200b',
            value: progress
          }
        ],
        color: 0xffffff
      }
    ]
  });
}
