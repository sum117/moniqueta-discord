import {db} from '../../../db.js'
export const data = {
    name: 'debug',
    kind: 'regular',
    description: 'Debuga o valor de edição do playcard, que geralmente gera bugs.'
};

/**
 * @param {Message} msg A mensagem que iniciou o comando.
 * @param {String} args Os argumentos enviados pelo bot para a execução do comando.
 */
export async function execute(msg) {
    await db.set(msg.author.id + '.isEditting', false)
    return msg.reply('Você foi debugado com sucesso. pelo menos é o que se espera. Se ainda não conseguir enviar mensagens com seu playcard, entre em contato com um administrador.')
}