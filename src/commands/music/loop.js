import {QueueRepeatMode} from 'discord-player';
export const data = {
  name: 'loop',
  type: 'music',
  description: 'Me faça repetir sua música!',
  options: [
    {
      name: 'mode',
      type: 'INTEGER',
      description: 'Loop type',
      required: true,
      choices: [
        {
          name: 'Off',
          value: QueueRepeatMode.OFF
        },
        {
          name: 'Musica',
          value: QueueRepeatMode.TRACK
        },
        {
          name: 'Fila',
          value: QueueRepeatMode.QUEUE
        },
        {
          name: 'Autoplay',
          value: QueueRepeatMode.AUTOPLAY
        }
      ]
    }
  ]
};
export async function execute(interaction, player) {
  try {
    await interaction.deferReply();

    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) {
      return void interaction.followUp({content: '❌ Não tô tocando nada, mas eu posso começar... é só pedir!'});
    }

    const loopMode = interaction.options.get('mode').value;
    const success = queue.setRepeatMode(loopMode);
    const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';

    return void interaction.followUp({
      content: success ? `${mode} | Updated loop mode!` : '❌ Não pude atualizar o modo de loop... buguei.'
    });
  } catch (error) {
    console.log(error);
    interaction.followUp({
      content: 'Houve um erro no meu último comando... marca o dono? ' + error.message
    });
  }
}
