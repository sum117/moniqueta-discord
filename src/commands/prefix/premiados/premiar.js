import {Message} from 'discord.js';
import {db} from '../../../db.js';
export const data = {
  name: 'premiar',
  kind: 'regular',
  description: 'Premia um personagem'
};
/**
 * @param {Message} msg A mensagem que iniciou o comando.
 */
export async function execute(msg, args) {
  if (args.length < 1)
    return msg.reply(
      'Você precisa especificar um personagem: `premiar <Primeiro Nome do Personagem> <Menção do Alvo>`'
    );
  args = args[0].trim();
  const targetUser = msg.mentions.users.first();
  if (!targetUser) return msg.reply('Você precisa mencionar um usuário.');

  let char = await db.table('sdc_premiados').get(args);
  if (!char) return msg.reply('Personagem não encontrado.');
  char = char.referencia;
  if (char.authorId !== msg.author.id)
    return msg.reply(
      'Não é possível premiar um personagem que não lhe pertence.'
    );
  if (char?.premiado) return msg.reply('Personagem já premiado.');

  await db.table('sdc_premiados').set(args + '.premiado', true);
  let charCount = await db.get(targetUser.id + '.count');
  await db.set(targetUser.id + '.chars.' + ++charCount, char);
  return msg.reply({
    content:
      'Personagem premiado com sucesso!\n Parabéns ' +
      targetUser.username +
      '!',
    embeds: [
      {
        author: {
          name: char.title.str,
          icon_url: char.title.icon
        },
        title: char.name,
        description: char.appearance,
        color: '#36393f',
        image: {url: char.avatar}
      }
    ]
  });
}
