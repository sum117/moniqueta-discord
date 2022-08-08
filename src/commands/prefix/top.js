import {db} from '../../db.js';
import {MessageEmbed, Message} from 'discord.js';
import {userMention} from '@discordjs/builders';

export const data = {
  name: 'Top de Mensagens',
  type: 'regular',
  description: 'Mostra o top de mensagens do servidor.'
};

/**
 * @param {Message} msg A mensagem que iniciou o comando.
 * @param {String} args Os argumentos enviados pelo bot para a execução do comando.
 */
export async function execute(msg) {
  const { firstPlace, str } = await fetchList(msg);

  const embed = new MessageEmbed()
    .setTitle('🏆 MENSAGENS - TOP 10 🏆')
    .setDescription(str)
    .setColor('RANDOM')
    .setTimestamp(Date.now())
    .setThumbnail(firstPlace.user.avatarURL({dynamic: true, size:512}));
  await msg.reply({embeds: [embed]});
}

async function fetchList(msg) {
  const msgTop = await db.table('msgTop').all();
  let firstPlace;
  const str = msgTop
    .filter(entry => !['987919485367369749', '432610292342587392'].includes(entry.id))
    .sort( (entryBefore, entryAfter) => entryAfter.value - entryBefore.value)
    .map((entry, index) => {
      switch (index) {
        case 0:
          const fetchMember = async (userId) => await msg.guild.members.fetch({ user: userId });
          fetchMember(entry.id).then(member => firstPlace = member)
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
	  (await msg.reply('Carregando...')).delete()
  } while (firstPlace === undefined)
  return { firstPlace, str };
}

