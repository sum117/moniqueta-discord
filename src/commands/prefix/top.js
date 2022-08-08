import {db} from './src/db.js';
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
  const msgTop = await db.table('msgTop').all();
  let firstPlace;
  const str = await msgTop
    .sort((entryBefore, entryAfter) => entryAfter.value - entryBefore.value)
    .map(async (entry, index) => {
      switch (index) {
        case 0:
          const fetchMember = async user => await msg?.guild.members.fetch({user: user.id});
          firstPlace = await fetchMember(entry.id, msg);
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

  const embed = new MessageEmbed()
    .setTitle('🏆 MENSAGENS - TOP 10 🏆')
    .setDescription(str)
    .setColor('RANDOM')
    .setTimestamp(Date.now())
    .setThumbnail(firstPlace.user.displayAvatarURL({dynamic: true, size: 512}));
  await msg.reply({embeds: [embed]});
}
