import {roleMention, userMention} from '@discordjs/builders';

import {channels, roles} from '../../util';
export const data = {
  event: 'messageCreate',
  name: 'Script de entrada do servidor.',
  description:
    'Desbloqueia o servidor quando o usuário digita o número 18, que corresponde à resposta do questionário.'
};
/** @param {Message} msg */
export async function execute(client, msg) {
  if (msg.channelId === channels.entranceChannel && !msg.author.bot) {
    let response;
    if (msg.content.match(/18/)) {
      if (!msg.member.roles.cache.has(roles.entranceRole)) {
        msg.member.roles.add(roles.entranceRole);
        response = await msg.reply({
          content: 'Bem vindo ao Somas do Amanhã, ' + msg.author.username + '.'
        });
        msg.guild.channels.cache
          .get(channels.generalChannel)
          .send(
            `${userMention(
              msg.author.id
            )} ganhou acesso à comunidade, ${roleMention(
              roles.welcomeRole
            )}! Falem com ele!`
          );
      }
    } else {
      response = await msg.reply({
        content:
          'Você colocou o resultado incorreto. Se acha que isso é um erro, contate um administrador.'
      });
    }
    setTimeout(
      () =>
        msg.delete().catch(err => {
          console.log(err + ' A mensagem não existe.');
          if (response) response.delete();
        }),
      5 * 1000
    );
  }
}
