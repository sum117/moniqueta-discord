import {CronJob} from 'cron';

export const data = {
  name: 'Mudae Roll Timer',
  type: 'cron',
  description: 'Atualiza um canal do servidor com um temporizador da mudae.'
};

export function execute(client, timer, channel, role) {
  timer = client.channels.cache.get(timer);
  channel = client.channels.cache.get(channel);
  const update = async () => {
    const isGreen = timer.name.startsWith('🟢');
    await timer.edit({
      name: isGreen ? '🔴 Mudae...' : '🟢 Mudae!'
    });
    if (!isGreen) await channel.send(`${role ? `❤️ Hora da mudae, <@&${role}>!` : '❤️ Hora da mudae, pessoal!'}`);
    return isGreen;
  };

  return new CronJob('0 33,40 * * * *', update, null, true, 'America/Recife');
}
