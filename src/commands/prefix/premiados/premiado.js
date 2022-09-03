import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  userMention
} from 'discord.js';

import {db} from '../../../db';
import {channels, delay} from '../../../util';
export const data = {
  name: 'Gerador de Premiados',
  kind: 'regular',
  description: 'Gera um personagem aleatório para o SDC'
};
/**
 * @param {Message} msg A mensagem que iniciou o comando.
 */
export async function execute(msg) {
  /**
   * @typedef Character
   * @property {string} nome ID do personagem.
   * @property {{name: string, iconURL: string}} titulo Titulo do personagem.
   * @property {string} sobrenome Sobrenome do personagem.
   * @property {string} genero Gênero do personagem.
   * @property {string} sexualidade Sexualidade do personagem.
   *
   * @property {string} personalidade Personalidade do personagem.
   * @property {string} dieta Dieta do personagem.
   * @property {string} afiliacao Afiliação do personagem.
   *
   * @property {string} fisico Físico do personagem.
   * @property {string} caracteristicas Características do personagem.
   * @property {string} habilidade Habilidades do personagem.
   *
   * @property {string} dificuldade Dificuldade do personagem.
   * @property {string} bio Descrição do personagem.
   * @property {string} imagem URL da imagem do personagem.
   *
   * @property {number} cliques Cliques do personagem.
   * @property {Function} referencia Referência do personagem através do id.
   */
  /**
   * @type {Character}
   */
  /**
   *
   * @param {Message} msg A mensagem que iniciou o comando.
   * @param {Character} character O personagem que será enviado.
   */
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) return;
  try {
    return prompt();
  } catch (e) {
    console.log(e);
  }
  async function prompt(
    character = {
      afiliacao: '',
      caracteristicas: '',
      cliques: 0,
      dieta: '',
      dificuldade: '',
      fisico: '',
      habilidade: '',
      imagem: '',
      nome: '',
      sobrenome: '',
      sexualidade: '',
      personalidade: '',
      titulo: {
        name: '',
        iconURL: ''
      },
      referencia: ''
    }
  ) {
    msg.reply(
      `
      Para começar, escreva o nome do personagem!
    💡*Digite \`cancelar\` a qualquer momento para parar a geração.*
      `
    );
    const collector = msg.channel.createMessageCollector({
      filter: m => m.author.id === msg.author.id,
      time: 20 * 60 * 1000
    });
    let prompts = [
        'nome',
        'titulo.name',
        'titulo.iconURL',
        'sobrenome',
        'genero',
        'sexualidade',
        'personalidade',
        'dieta',
        'afiliacao',
        'fisico',
        'caracteristicas',
        'habilidade',
        'dificuldade',
        'bio',
        'referencia',
        'imagem'
      ],
      index = 0;

    let loading = await new Promise((resolve, reject) => {
      const reply = (content = '💡 ' + prompts[index].toUpperCase() + ':') =>
        msg.reply(
          content === '💡 TITULO.NAME:'
            ? '💡 Nome do titulo: '
            : content === '💡 TITULO.ICONURL:'
            ? '💡 Anexe o icone do titulo: '
            : content
        );
      collector.on('collect', async m => {
        if (m.content === 'cancelar') {
          collector.stop();
          await reply('✅ GERADOR CANCELADO COM SUCESSO.');
          return reject('Cancelado.');
        }
        switch (prompts[index]) {
          case 'titulo.name':
            character.titulo.name = m.content;
            index++;
            await reply();
            break;
          case 'titulo.iconURL':
            const titleIconProxyURL = m.attachments.first()?.proxyURL;
            if (titleIconProxyURL) {
              character.titulo.iconURL = titleIconProxyURL;
              index++;
              await reply();
            } else await reply('💡 Anexe o icone do titulo (O último falhou):');
            break;
          case 'referencia':
            const regex = m.content.match(/\d+/)?.[0];
            const char = await db.get(msg.author.id + '.chars.' + regex);
            await msg.reply('❔ Referencia: ' + regex + ' ' + typeof regex);
            if (char) {
              delete char.value;
              char.authorId = msg.author.id;
              character.referencia = char;
              index++;
              await reply();
            } else
              await reply(
                '💡 Escreva o ID do personagem para referenciar no seu banco de dados (O último não funcionou):'
              );
            break;
          case 'imagem':
            const imageProxyURL = m.attachments.first()?.proxyURL;
            if (imageProxyURL) {
              character.imagem = imageProxyURL;
              let loading = await reply(
                '<a:loading:1014800574228746291> Finalizando...'
              );
              collector.stop();
              await delay(2);
              return resolve(loading);
            } else await reply('💡 Anexe a imagem (A último falhou):');
          default:
            character[prompts[index]] = m.content;
            index++;
            await reply();
            break;
        }
      });
    });
    if (!loading) return msg.reply('💡 Ocorreu um erro ao gerar o personagem.');

    await db.table('sdc_premiados').set(character.nome, character);
    await loading.edit('🎉 Personagem gerado com sucesso!');
    let channel = msg.guild.channels.cache.get(channels.sdcPremiadosChannel);
    let post = await channel.send({
      content: 'Personagem feito por ' + userMention(msg.author.id),
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: character.titulo.name,
            iconURL: character.titulo.iconURL + '?size=128'
          })
          .setTitle(character.nome + ' ' + character.sobrenome)
          .setColor('#36393f')
          .setDescription(
            '📖 Você pode clicar no botão abaixo para sabe mais sobre o personagem.'
          )
          .setImage(character.imagem)
          .setFooter({
            text: `Cliques de ${character.nome}: ${character.cliques}`,
            iconURL:
              'https://cdn.discordapp.com/attachments/982056667564896296/1014809210724298752/unknown.png'
          })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(character.nome)
            .setStyle(ButtonStyle.Success)
            .setLabel('Ver personagem')
            .setEmoji('👀')
        )
      ]
    });
    return post.react('❤️');
  }
}
