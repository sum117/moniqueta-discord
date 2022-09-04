export const data = {
  name: 'calc',
  kind: 'regular',
  description: 'Calcula uma expressão matemática'
};
/**
 * @param {Message} msg A mensagem que iniciou o comando.
 * @param {String} args Os argumentos enviados pelo bot para a execução do comando.
 */
export async function execute(msg, args) {
  args = args.join('');
  args = args.replace(/x/g, '*');
  args = args.replace(/÷/g, '/');
  args = args.replace(/,/g, '.');
  args = args.replace(/ /g, '');
  args = args.replace(/\^/g, '**');
  args = args.replace(/%/g, '/100');
  args = args.replace(/[^0-9+*(){}.\[\]\/\-]/gm, '');

  if (args.length === 0) {
    msg.channel.send('Você precisa me dizer o que eu devo calcular!');
    return;
  }

  try {
    const result = eval(args);
    msg.channel.send(
      `O resultado de \`${
        args.length >= 1900 ? args.slice(0, 1900) + '...' : args
      }\` é **${result}**`
    );
  } catch {
    msg.channel.send('Não foi possível calcular a expressão.');
  }
}
