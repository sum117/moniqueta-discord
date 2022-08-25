
export const data = {
  event: 'messageCreate',
  kind: 'regular',
  name: 'Diga Olá',
  description: 'O bot dirá olá. Comando feito por razões de teste.'
};

/** @param {Message} msg A mensagem que executou este comando*/
export async function execute(msg) {
  msg.reply('Olá!');
}
