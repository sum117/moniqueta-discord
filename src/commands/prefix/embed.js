import {MessageEmbed} from 'discord.js';
import {userMention, codeBlock} from '@discordjs/builders';
export const data = {
  event: 'messageCreate',
  name: 'Gerador de Embed',
  description: 'Comando de moderador para gerar descrições de canais.',
};

export async function execute(msg, args) {
  const content = args.join(' ');
  const paragraphs = content.split('\n');
  if (paragraphs.length < 2) {
    return msg.reply(
      '❌Você o que é preciso para a execução deste comando! Tente: ' +
        codeBlock('$embed <Descrição do Canal>\n<Link de Imagem>'),
    );
  }
  /**
   * @type {Array<String>}
   * @var unparsedTitle O título do Embed que virá do nome do canal.
   */
  const unparsedTitle = msg.channel.name.split('-');
  /** @type {Array<String>} @var parsedTitle Array que virá da função ForEach com a string capitalizada.*/
  const parsedTitle = [];
  unparsedTitle.forEach(word => {
    if (word.match(/^d((o|a)s?|e)$/)) return parsedTitle.push(word);

    const newWord = word.charAt(0).toUpperCase() + word.slice(1);
    return parsedTitle.push(newWord);
  });

  const link = paragraphs.pop();
  if (!link?.includes('http')) return msg.channel.send('❌ Você não informou um link no último elemento do parâmetro.');

  const embed = new MessageEmbed()
    .setTitle(parsedTitle.join(' '))
    .setDescription(paragraphs.join('\n'))
    .setImage(link)
    .setColor('RANDOM')
    .setAuthor({
      iconURL: msg.guild.iconURL({dynamic: true, size: 1024}),
      name: msg.channel.parent.name.slice(1).replace(/\| RP/, ''),
    })
    .setFooter({
      text: '💡 Quer dar uma nova descrição ao canal? Contate os Admins!',
    });
  msg.channel.send({
    content: 'Descrição atual produzida por ' + userMention(msg.author.id),
    embeds: [embed],
  });
}
