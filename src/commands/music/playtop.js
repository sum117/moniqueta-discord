import {QueryType} from 'discord-player';

export const data = {
  name: 'playtop',
  type: 'music',
  description: 'Toque uma música antes da próxima no seu canal!!',
  options: [
    {
      name: 'query',
      type: 3, // 'STRING' Type
      description: 'A Música que você quer tocar.',
      required: true,
    },
  ],
};
export async function execute(interaction, player) {
  try {
    await interaction.deferReply();

    const query = interaction.options.get('query').value;
    const searchResult = await player
      .search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      })
      .catch(() => {});
    if (!searchResult || !searchResult.tracks.length) {
      return void interaction.followUp({content: 'Não... encontrei nada com essas suas palavras estranhas, cara.'});
    }

    const queue = await player.createQueue(interaction.guild, {
      ytdlOptions: {
        quality: 'highest',
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
      },
      metadata: interaction.channel,
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
      void player.deleteQueue(interaction.guildId);
      return void interaction.followUp({
        content: 'Abre espaço! Não tem lugar pra mim aí!',
      });
    }

    await interaction.followUp({
      content: `⏱ Carregando sua... ${searchResult.playlist ? 'playlist' : 'música'}...`,
    });
    searchResult.playlist ? queue.insert(searchResult.tracks, 0) : queue.insert(searchResult.tracks[0], 0);
    if (!queue.playing) await queue.play();
  } catch (error) {
    console.log(error);
    interaction.followUp({
      content: 'Eu...buguei aqui ó: ' + error.message,
    });
  }
}
