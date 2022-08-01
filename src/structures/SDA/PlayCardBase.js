import {
  ButtonInteraction,
  CommandInteraction,
  Formatters,
  Interaction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import {db} from '../../db.js';
import {title} from '../../util';

const {userMention} = Formatters;

export const assets = {
  sum: {
    austera: {color: 10517508, emoji: '<:Austeros:982077481702027344>'},
    perserata: {color: 550020, emoji: '<:Perserata:982078451513184306>'},
    insanata: {color: 11535364, emoji: '<:Insanata:982078436166221874>'},
    equinocio: {color: 562180, emoji: '<:Equinocio:982082685889564772>'},
    oscuras: {color: 3146828, emoji: '<:Oscuras:982082685835051078>'},
    ehrantos: {color: 15236108, emoji: '<:Ehrantos:982082685793087578>'},
    melancus: {color: 0, emoji: '<:Melancus:982082685801472060>'},
    observata: {
      color: 16777215,
      emoji: '<:Observata:982082685864378418>',
    },
    invidia: {color: 547996, emoji: '<:Invidia:982082685503696967>'},
  },
  phantom: {
    azul: '<:fantasmaAzul:982092065523507290>',
    vermelho: '<:fantasmaVermelho:982092065989074994>',
    branco: '<:fantasmaBranco:982092065599029268>',
  },
};

export class PlayCardBase {
  /** @param {Interaction} interaction  */
  constructor() {
    this.character = async (interaction, user) => {
      const chosenChar = await db.get(`${user.id}.chosenChar`);
      if (!chosenChar) {
        throw (
          (await interaction[interaction.deferred ? 'editReply' : 'reply']({
            content: `Não há nenhum personagem criado ou selecionado para ${
              user.id === interaction.user.id ? 'você' : user
            }`,
          }),
          new Error('Erro de personagem não criado ou selecionado acionado por: ' + user.id))
        );
      } else return await db.get(`${user.id}.chars.${chosenChar}`);
    };
  }
  /**
   * @param {ButtonInteraction} - Usuário que teve seu personagem criado
   * @param {Object} character - Objeto que contém todas as informações do personagem
   * @param {String} character.name - Nome do personagem
   * @param {String} character.gender - Gênero do personagem
   * @param {String} character.personality - Personalidade do personagem
   * @param {String} character.appearance - Aparencia do personagem
   * @param {String} character.avatar - Avatar do personagem
   * @param {('austera'|'perserata'|'insanata'|'equinocio'|'oscuras'|'ehrantos'|'melancus'|'observata'|'invidia')} character.sum - O nome da soma do personagem
   * @param {('azul'|'vermelho'|'branco')} character.phantom - O purgatório do personagem
   * @return {Promise<Message>} `Mensagem` - A mensagem confirmando que o personagem foi criado
   */
  async create({message, user, guild}, approvedChannelId, character = {}) {
    const {name, gender, personality, appearance, avatar, sum, phantom} = character;
    const {members, channels} = guild;

    const userId = user.id;
    const id = await db.get(`${userId}.count`);
    const charObject = {
      name: name,
      gender: gender,
      personality: personality,
      appearance: appearance,
      avatar: avatar,
      sum: sum,
      phantom: phantom,
      skills: {
        vitalidade: 40,
        força: 20,
        resistência: 25,
        vigor: 15,
        destreza: 17,
      },
      equipamentos: {
        cabeça: {
          nome: 'Capacete de Ferro',
          base: 8,
          multiplicador: {
            num: 1.75,
            tipo: 'resistência',
          },
        },
        pescoço: {
          nome: 'Amuleto de Darandur',
          base: 5,
          multiplicador: {
            num: 1.5,
            tipo: 'vigor',
          },
        },
        ombros: {
          nome: 'Mochila do Sapo Ardente',
        },
        maos: {
          nome: 'Luvas do Tanner',
          base: 3,
          multiplicador: {
            num: 1.5,
            tipo: 'destreza',
          },
        },
        peitoral: {
          nome: 'Cota de Malha',
          base: 10,
          multiplicador: {
            num: 2.5,
            tipo: 'resistência',
          },
        },
        cintura: {
          nome: 'Cinto de Explorador',
        },
        pernas: {
          nome: 'Calça de Couro',
          base: 8,
          multiplicador: {
            num: 2,
            tipo: 'resistência',
          },
        },
        pes: {
          nome: 'Botas de Couro',
          base: 5,
          multiplicador: {
            num: 1.5,
            tipo: 'resistência',
          },
        },
      },
      armas: {
        armaPrimaria: {
          nome: 'Machado de Ferro',
          base: 78,
          tipo: 'pesada',
          multiplicador: {
            num: 3.2,
            tipo: 'força',
          },
        },
        armaSecundaria: {},
      },
    };
    if (!id) {
      await db.set(`${userId}`, {
        chosenChar: 1,
        count: 1,
        chars: {
          ['1']: charObject,
        },
      });
    } else {
      await db.add(`${userId}.count`, 1);
      await db.set(`${userId}.chars.${id + 1}`, charObject);
    }
    const membro = await members.fetch(userId);
    const aprovador = user;
    const canalAprovados = await channels.fetch(approvedChannelId);
    return canalAprovados.send({
      content: `Ficha de ${userMention(membro.user.id)}, aprovada por ${userMention(aprovador.id)}`,
      embeds: [
        new MessageEmbed()
          .setTitle(name)
          .setThumbnail(avatar)
          .setColor(assets.sum[sum].color)
          .setDescription(appearance)
          .setAuthor({
            name: membro.user.username,
            iconURL: membro.user.avatarURL({
              dynamic: true,
              size: 512,
            }),
          })
          .addField(
            'Gênero',
            gender === 'masculino' ? '♂️ Masculino' : gender === 'feminino' ? '♀️ Feminino' : '👽 Descubra',
            true,
          )
          .addField('Purgatório', assets.phantom[phantom] + ' ' + title(phantom), true)
          .addField('Soma', assets.sum[sum].emoji + ' ' + title(sum), true),
      ],
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction | A mensagem ou comando que iniciou o comando
   * @param {('edit'|'remove'|'send')} action A ação escolhida para a classe.
   * @param {MessageAttachment} attachment A imagem que será usada para a ação.
   */
  async interact(interaction, action, content = '', attachment = null) {
    let file;
    if (attachment) file = attachment.name;
    const {user, channel, guildId} = interaction;

    const data = await this.character(interaction, user);

    const {name, avatar, sum} = data;

    switch (action) {
      case 'send':
        const msg = await send();
        return await db.set(user.id + '.latestMessage', {
          id: `${msg.id}`,
          channelId: `${msg.channelId}`,
          time: Date.now(),
          token: false,
        });
      case 'edit':
        return edit(await db.get(user.id + '.latestMessage.id'));
      case 'remove':
        return remove(content ? content : await db.get(user.id + '.latestMessage.id'));
    }

    async function send() {
      const message = await channel.send({
        embeds: [
          {
            title: name,
            thumbnail: {
              url: avatar,
            },
            image: attachment ? {url: `attachment://${attachment.name}`} : undefined,
            color: assets.sum[sum].color,
            description: content,
            footer: {
              text: user.username,
              icon_url: user.avatarURL({
                dynamic: true,
                size: 512,
              }),
            },
          },
        ],
        files: attachment
          ? [
              {
                attachment: attachment.attachment,
                name: attachment.name,
              },
            ]
          : [],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton().setCustomId('interact').setEmoji('🖐️').setLabel('Interagir').setStyle('SECONDARY'),
          ),
        ],
      });
      await db.set(`${guildId}.charMessages.${message.id}`, user.id);
      return message;
    }
    async function edit(msgId) {
      if (!msgId) throw new Error('Não foi possível encontrar a mensagem para ser editada');
      const embed = (await channel.messages.fetch(msgId)).embeds[0];
      embed.setDescription(content);
      return await channel.messages.edit(msgId, {
        embeds: [embed],
      });
    }
    async function remove(msgId) {
      const messageToCheck = await db.get(`${guildId}.charMessages.${msgId}`);
      if (!msgId) {
        throw interaction[interaction.deferred ? 'editReply' : 'reply']({
          content: 'Não foi possível encontrar a mensagem para ser removida',
        });
      } else if (messageToCheck !== user.id) {
        throw interaction[interaction.deferred ? 'editReply' : 'reply']({
          content: 'Você não pode deletar uma mensagem que não pertence a você.',
        });
      }

      if (msgId === (await db.get(user.id + '.latestMessage.id'))) db.delete(user.id + '.latestMessage');
      return await channel.messages.delete(msgId);
    }
  }
}
