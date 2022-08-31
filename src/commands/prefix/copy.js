export const data = {
  name: 'Copiar Mensagem',
  kind: 'regular',
  description:
    'Copia e cola as mensagens para serem usadas em outros canais ou por outros bots.'
};
/**
 * @param {Message} msg A mensagem que iniciou o comando.
 * @param {String} args Os argumentos enviados pelo bot para a execução do comando.
 */
export async function execute(msg, args) {
  if (!msg.member.permissions.has('manageGuild')) {
    return msg.reply('❌ Você não tem permissão para usar este comando.');
  }
  for (const messageToCopy of args) {
    const matches = messageToCopy.match(
      /(?:https:\/\/discord\.com\/channels\/)(?<guild>\d+)\/(?<channel>\d+)\/(?<msg>\d+)/
    );
    if (!matches)
      return msg.reply('❌ Uma das Mensagens é inválida: ' + messageToCopy);
    const channel = await msg.guild.channels.fetch(matches.groups.channel);
    const message = await channel.messages.fetch(matches.groups.msg);
    if (!message)
      return msg.reply('❌ Não encontrei a mensagem: ' + messageToCopy);
    await msg.channel.send({
      content: message?.content ?? `Mensagem enviada em ${channel}`,
      embeds: message.embeds,
      components: message.components
    });
  }
}
