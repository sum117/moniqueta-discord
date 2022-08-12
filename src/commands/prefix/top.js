import {db} from '../../db.js';
import {MessageEmbed} from 'discord.js';
import {userMention} from '@discordjs/builders';

export const data = {
  name: 'Top de Mensagens',
  kind: 'regular',
  description: 'Mostra o top de mensagens do servidor.'
};

/**
 * @param {Message} msg A mensagem que iniciou o comando.
 * @param {String} args Os argumentos enviados pelo bot para a execução do comando.
 */
export async function execute(msg) {
  const members = (await msg.guild.members.fetch()).filter(member => !member.user.bot);

  const msgTop = await db.table('msgTop').all();
  let firstPlace;
  const str = msgTop
    .filter(entry => members.map(member => member.id).includes(entry.id))
    .sort((entryBefore, entryAfter) => entryAfter.value - entryBefore.value)
    .map((entry, index) => {
      switch (index) {
        case 0:
          const getMember = userId => members.find(member => member.id === userId);
          firstPlace = getMember(entry.id);
          return `👑 ${userMention(entry.id)} - ${entry.value}`;
        case 1:
          return `🥈 ${userMention(entry.id)} - ${entry.value}`;
        case 2:
          return `🥉 ${userMention(entry.id)} - ${entry.value}`;
        default:
          return `${index + 1}. ${userMention(entry.id)} - ${entry.value}`;
      }
    })
    .splice(0, 15)
    .join('\n');

  do {
    (await msg.reply('Carregando...')).delete();
  } while (firstPlace === undefined);

  const embed = new MessageEmbed()
    .setTitle('🏆 MENSAGENS - TOP 15 🏆')
    .setDescription(str)
    .setColor('RANDOM')
    .setTimestamp(Date.now())
    .setThumbnail(firstPlace.user.avatarURL({dynamic: true, size: 512}));

  await msg.reply({embeds: [embed]});
}
