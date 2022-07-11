import { Message } from 'discord.js';

export default {
    name: '☢️ Bomba Nuclear',
    description: 'ELE VAI DAR PURGE, ELE VAI DAR PURGE!',
    /**
     * @param {Message} msg A mensagem que deu inicio ao comando
     * @param {Number} number  O numero de iterações.
     */
    async execute(msg) {
        if (!msg.member.permissions.has('MANAGE_GUILD'))
            return msg.reply(
                '❌ Apenas administradores podem usar bombas nucleares.'
            );
        await msg.channel.send({
            content:
                '☢️ Bomba Nuclear lançada por ' +
                msg.author.username +
                '. Ela irá detonar em 45 segundos. Nada mais importa...',
            files: [
                {
                    attachment: './src/commands/resources/bomba.gif',
                    name: 'bomba.gif'
                },
                {
                    attachment: './src/commands/resources/bomba.mp3',
                    name: 'bomba.mp3'
                }
            ]
        });
        setTimeout(async () => {
            const pobresCoitadas = await (
                await msg.channel.fetch()
            ).messages.fetch({ limit: 100 });
            await msg.channel.send('Detonando!');
            await msg.channel.bulkDelete(pobresCoitadas);
        }, 45 * 1000);
    }
};
