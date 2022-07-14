
import { MessageEmbed } from 'discord.js';
import { userMention } from '@discordjs/builders';
export default {
  event: 'messageCreate',
  name: 'Description Embed Generator',
  description: 'Comando de moderador para gerar descrições de canais.',
  execute(msg) {
    return new Promise((resolve) => {
      const content = msg.content;
      if (content.includes('embed')) {
        const args = content.split('\n');
        const parsed = args.shift();

        if (parsed.includes('embed')) {
          /**
           * @type {Array<String>}
           * @var unparsedTitle O título do Embed que virá do nome do canal.
           */
          let unparsedTitle = msg.channel.name.split('-');
          /**@type {Array<String>} @var parsedTitle Array que virá da função ForEach com a string capitalizada.*/
          let parsedTitle = [];
          unparsedTitle.forEach((word) => {
            if (word.match(/^d((o|a)s?|e)$/)) return parsedTitle.push(word);

            const newWord = word.charAt(0).toUpperCase() + word.slice(1);
            return parsedTitle.push(newWord);
          });

          const link = args.pop();
          if (!link?.includes('http'))
            return msg.channel.send(
              '❌ Você não informou um link no último elemento do parâmetro.',
            );

          let embed = new MessageEmbed()
            .setTitle(parsedTitle.join(' '))
            .setDescription(args.join('\n'))
            .setImage(link)
            .setColor('RANDOM')
            .setAuthor({
              iconURL: msg.guild.iconURL({ dynamic: true, size: 1024 }),
              name: msg.channel.parent.name.slice(1).replace(/\| RP/, ''),
            })
            .setFooter({
              text: '💡 Quer dar uma nova descrição ao canal? Contate os Admins!',
            });
          resolve(
            msg.channel.send({
              content:
                'Descrição atual produzida por ' + userMention(msg.author.id),
              embeds: [embed],
            }))
        }
      }
    });
  },
};
