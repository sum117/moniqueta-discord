import {channelMention, userMention} from '@discordjs/builders';
import {AttachmentBuilder} from 'discord.js';

import {bulkEmoji, channels} from '../../util';
export const data = {
  event: 'messageCreate',
  name: 'Media Moderator',
  description: 'Um comando automático do servidor que coloca as mensagens em seus devidos lugares.'
};
export function execute(client, msg) {
  if (msg.channelId === channels.generalChannel && (msg.attachments.size >= 1 || msg.content.match(/https?/g))) {
    setTimeout(() => {
      if (msg.attachments.size >= 1) {
        msg.attachments.forEach(attachment => {
          const media = new AttachmentBuilder(attachment.url);

          msg.guild.channels.cache
            .get(channels.mediaChannel)
            .send({
              content: `Imagem enviada em ${channelMention(channels.generalChannel)} por ${userMention(msg.author.id)}`,
              files: [media]
            })
            .then(mediaMsg => {
              bulkEmoji(mediaMsg, ['✅', '❌']);
            })
            .catch(err => console.log('Não consegui reagir a mensagem: ' + err))
            .then(() => msg.delete())
            .catch(err => console.log('Erro, a mensagem não existe: ' + err));
        });
      } else {
        msg.guild.channels.cache
          .get(channels.mediaChannel)
          .send({
            content: `Link(s) enviado(s) em ${channelMention(channels.generalChannel)} por ${userMention(
              msg.author.id
            )}:\n${msg.content.match(/https?.*/g)}`
          })
          .then(mediaMsg => {
            bulkEmoji(mediaMsg, ['✅', '❌']);
          })
          .catch(err => console.log('Não consegui reagir a mensagem: ' + err))
          .then(() => msg.delete())
          .catch(err => console.log('Erro, a mensagem não existe: ' + err));
      }
    }, 60 * 1000);
  }
}
