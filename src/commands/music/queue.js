export const data = {
  name: 'queue',
  type: 'music',
  description: 'Veja a lista de sons que estão sendo tocados agora!'
};

export async function execute(interaction, player) {
  const queue = player.getQueue(interaction.guildId);
  if (typeof queue != 'undefined') {
    const trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
    return void interaction.reply({
      embeds: [
        {
          title: '💘 Agora tocando ~',
          description: trimString(
            `A música que estou tocando agora é a 🎶 | **${queue.current.title}**! \n 🎶 | **${queue}**! `,
            4095
          )
        }
      ]
    });
  } else {
    return void interaction.reply({
      content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'
    });
  }
}
