export const data = {
  name: 'shuffle',
  kind: 'music',
  description: 'Deixe tudo muito louco, aleatório, entende?!'
};
export async function execute(interaction, player) {
  await interaction.deferReply();
  const queue = player.getQueue(interaction.guildId);
  if (!queue || !queue.playing) {
    return void interaction.followUp({content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'});
  }
  try {
    queue.shuffle();
    const trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
    return void interaction.followUp({
      embeds: [
        {
          title: '💘 Agora tocando ~',
          description: trimString(
            `The Current song playing is 🎶 | **${queue.current.title}**! \n 🎶 | ${queue}! `,
            4095
          )
        }
      ]
    });
  } catch (error) {
    console.log(error);
    return void interaction.followUp({
      content: '❌ Eu... buguei aí!'
    });
  }
}
