import {bold, Colors, userMention} from 'discord.js';

import {db} from '../../../db.js';

export const data = {
  name: 'mestres',
  kind: 'regular',
  description: 'Cria um top de mestres'
};

/**
 * @param {Message} msg A mensagem que iniciou o comando.
 */
export async function execute(msg) {
  msg.reply({
    embeds: [
      {
        title: '🏆 Top de Mestres 🏆',
        thumbnail: {url: msg.guild.iconURL({size: 512})},
        description: await getTop(),
        color: Colors.Red
      }
    ]
  });
}

async function getTop() {
  const adminArray = [
    '317070060290179072',
    '708401488682156123',
    '273657962625761280',
    '138035353700401152',
    '969062359442280548',
    '423574776036982784',
    '596839131426979846',
    '418907270764560385',
    '777624354560802876'
  ];
  let letters = await db.all();
  letters = letters.filter(entry => adminArray.includes(entry.id));
  letters = letters.map(({id, value: {chars}}) => {
    chars = Object.values(chars)
      .map(char => char?.xpCount)
      .filter(xp => xp !== undefined)
      .reduce((a, b) => a + b, 0);
    return {[id]: chars};
  });
  letters = letters.sort((a, b) => {
    const aVal = Object.values(a)[0];
    const bVal = Object.values(b)[0];
    return bVal - aVal;
  });
  return letters
    .map((entry, index) => {
      index++;
      const id = Object.keys(entry)[0];
      const xp = Object.values(entry)[0];
      return `${index}. ${userMention(id)} - ${bold(xp + ' XP')}`;
    })
    .join('\n');
}