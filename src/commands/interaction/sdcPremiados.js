import {EmbedBuilder, userMention} from 'discord.js';

import {db} from '../../db.js';
import {channels} from '../../util';

export const data = {
  event: 'interactionCreate',
  type: 'buttonInteraction',
  name: 'sdc-premiados',
  description:
    'Faz o display de algumas informações sobre um personagem em leilão'
};

/**
 * @param {Interaction} interaction A interação que instanciou o comando.
 */
export async function execute(interaction) {
  if (interaction.channelId !== channels.sdcPremiadosChannel) return;
  await interaction.deferUpdate();
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
   */
  /**
   * @type {Character}
   */
  let character = await db.table('sdc_premiados').get(interaction.customId);
  if (!character)
    return interaction.editReply(
      'Personagem não encontrado. Isso é claramente um erro. Por favor, contate um administrador.'
    );
  try {
    /**
     * @type {string[]}
     */

    let personalidade = textSplit(character.personalidade),
      fisico = textSplit(character.fisico),
      caracteristicas = textSplit(character.caracteristicas),
      habilidade = textSplit(character.habilidade),
      bio = textSplit(character.bio),
      perfil = () => {
        personalidade.unshift('**Personalidade:** ');
        fisico.unshift('**Físico:** ');
        caracteristicas.unshift('**Características:** ');
        habilidade.unshift('**Habilidades:** ');
        bio.unshift('**Bio:** ');
        return [
          `${character.nome} ${character.sobrenome}`,
          `**Dificuldade:** ${character.dificuldade}`,
          `**Gênero:** ${character.genero}`,
          `**Afiliação:** ${character.afiliacao}`,
          `**Dieta:** ${character.dieta}`,
          `**Sexualidade:** ${character.sexualidade}`,
          `**Avatar:** ${character.imagem}`,
          ...personalidade,
          ...fisico,
          ...caracteristicas,
          ...habilidade,
          ...bio
        ];
      };
    const array = perfil();
    for (let each of array) await interaction.user.send(each);
    character.cliques++;
    await db.table('sdc_premiados').add(`${interaction.customId}.cliques`, 1);
    return interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setAuthor(character.titulo)
          .setTitle(array[0])
          .setColor('#36393f')
          .setImage(character.imagem)
          .setFooter({
            text: `Cliques de ${character.nome}: ${character.cliques}`,
            iconURL:
              'https://cdn.discordapp.com/attachments/982056667564896296/1014809210724298752/unknown.png'
          })
          .setDescription(
            '📖 Você pode clicar no botão abaixo para saber mais sobre o personagem.'
          )
      ]
    });
  } catch (error) {
    console.log(error);
    return interaction.followUp(
      `
      Erro ao enviar mensagem para você ${userMention(interaction.user.id)}!
      Por favor, certifique-se de que não está com DMs fechadas.
      `
    );
  }
}

function textSplit(text = '', maxLength = 1990) {
  if (text.length < maxLength) return [text];
  let splitted = [],
    times = Math.ceil(text.length / maxLength);

  for (let i = 0; i <= times; i++) {
    const a = text.substring(
      maxLength * i,
      text.lastIndexOf(' ', maxLength * (i + 1))
    );
    splitted.push(a);
  }
  console.log(splitted);
  return splitted;
}
