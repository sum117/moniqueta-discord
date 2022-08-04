import {
  ButtonInteraction,
  CommandInteraction,
  Formatters,
  Interaction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import {db} from '../../db.js';
import {statusBar, title} from '../../util';
import {bold} from '@discordjs/builders';
const {userMention} = Formatters;

export const assets = {
  skills: {
    vitalidade: '❤️',
    vigor: '💦',
    destreza: '🏃‍♂️',
    mente: '🧠',
    forca: '💪',
    resistencia: '🛡️',
    primordio: '🔖',
    elemental: '🔥',
    profano: '💀'
  },

  itens: {
    cabeça: '<:helmet:1004131097396912168>',
    pescoço: '<:amulet:1004145505921683466>',
    ombros: '<:capa:1004147328518725672>',
    maos: '<:gauntlet:1004131099334680616>',
    peitoral: '<:chest:1004131104833417246>',
    cintura: '<:belt:1004145504185241690>',
    pernas: '<:legs:1004131094678995035>',
    pes: '<:boots:1004130682794156083>',
    armaPrimaria: '<:battleaxe:1004131092112085063>',
    armaSecundaria: '<:battleshield:1004131103063412856>'
  },
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
      emoji: '<:Observata:982082685864378418>'
    },
    invidia: {color: 547996, emoji: '<:Invidia:982082685503696967>'}
  },
  phantom: {
    azul: '<:fantasmaAzul:982092065523507290>',
    vermelho: '<:fantasmaVermelho:982092065989074994>',
    branco: '<:fantasmaBranco:982092065599029268>'
  }
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
            }`
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
  async create({guild}, approvedChannelId, character = {}, user) {
    const {name, gender, personality, appearance, avatar, sum, phantom, equipamentos} = character;
    const {members, channels} = guild;

    const userId = user.id;
    const id = await db.get(`${userId}.count`);
    const charObject = char(name, gender, personality, appearance, avatar, sum, phantom, equipamentos);
    if (!id) {
      await db.set(`${userId}`, {
        chosenChar: 1,
        count: 1,
        chars: {
          ['1']: charObject
        }
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
              size: 512
            })
          })
          .addField(
            'Gênero',
            gender === 'masculino' ? '♂️ Masculino' : gender === 'feminino' ? '♀️ Feminino' : '👽 Descubra',
            true
          )
          .addField('Purgatório', assets.phantom[phantom] + ' ' + title(phantom), true)
          .addField('Soma', assets.sum[sum].emoji + ' ' + title(sum), true)
      ]
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction | A mensagem ou comando que iniciou o comando
   * @param {('edit'|'remove'|'send')} action A ação escolhida para a classe.
   * @param {MessageAttachment} attachment A imagem que será usada para a ação.
   */
  async interact(interaction, action, content = '', attachment = null) {
    const {user, channel, guildId} = interaction;

    const data = await this.character(interaction, user);
    const {name, avatar, sum} = data;

    switch (action) {
      case 'send':
        const msg = await send(data?.inCombat);
        return await db.set(user.id + '.latestMessage', {
          id: `${msg.id}`,
          channelId: `${msg.channelId}`,
          time: Date.now(),
          token: false
        });
      case 'edit':
        return edit(await db.get(user.id + '.latestMessage.id'));
      case 'remove':
        return remove(content ? content : await db.get(user.id + '.latestMessage.id'));
    }

    async function send(combat = false) {
      let combate;
      if (combat)
        combate = await (async () => {
          const batalha = await db.table('batalha_' + interaction.channelId).all();
          const status = batalha
            .map(obj => {
              const status = obj.value[user.id];
              return {saude: status.saude, vigor: status.vigor};
            })
            .shift();
          return status;
        })();
      const message = await channel.send({
        embeds: [
          {
            title: name,
            thumbnail: {
              url: avatar
            },
            image: attachment ? {url: `attachment://${attachment.name}`} : undefined,
            color: assets.sum[sum].color,
            description: content,
            footer: {
              text: user.username,
              icon_url: user.avatarURL({
                dynamic: true,
                size: 512
              })
            },
            [combat ? 'fields' : undefined]: [
              {
                name: 'ㅤ',
                value: `💓 ${statusBar(
                  combate?.saude,
                  data.skills.vitalidade * 10,
                  '<:barLife:994630714312106125>',
                  '<:BarEmpty:994631056378564750>'
                )}\n 💨 ${statusBar(
                  combate?.vigor,
                  data.skills.vigor * 5,
                  '<:barVigor:994630903181615215>',
                  '<:BarEmpty:994631056378564750>'
                )}`
              }
            ]
          }
        ],
        files: attachment
          ? [
              {
                attachment: attachment.attachment,
                name: attachment.name
              }
            ]
          : [],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton().setCustomId('interact').setEmoji('🖐️').setLabel('Interagir').setStyle('SECONDARY')
          )
        ]
      });
      await db.set(`${guildId}.charMessages.${message.id}`, user.id);
      return message;
    }
    async function edit(msgId) {
      if (!msgId) throw new Error('Não foi possível encontrar a mensagem para ser editada');
      const embed = (await channel.messages.fetch(msgId)).embeds[0];
      embed.setDescription(content);
      return await channel.messages.edit(msgId, {
        embeds: [embed]
      });
    }
    async function remove(msgId) {
      const messageToCheck = await db.get(`${guildId}.charMessages.${msgId}`);
      if (!msgId) {
        throw interaction[interaction.deferred ? 'editReply' : 'reply']({
          content: 'Não foi possível encontrar a mensagem para ser removida'
        });
      } else if (messageToCheck !== user.id) {
        throw interaction[interaction.deferred ? 'editReply' : 'reply']({
          content: 'Você não pode deletar uma mensagem que não pertence a você.'
        });
      }

      if (msgId === (await db.get(user.id + '.latestMessage.id'))) db.delete(user.id + '.latestMessage');
      return await channel.messages.delete(msgId);
    }
  }
  async list(interaction) {
    const {user} = interaction;
    const data = await this.character(interaction, user);
    const {avatar, sum} = data;

    const chosenCheck = await db.get(user.id + '.chosenChar');
    const list = Object.entries(await db.get(user.id + '.chars'))
      .map(([id, char]) => {
        return `${bold(id)} : ${assets.sum[char.sum].emoji} ${assets.phantom[char.phantom]} ${char.name} ${
          toString(chosenCheck) === toString(id) ? ' ⭐' : ''
        }`;
      })
      .join('\n');
    return await interaction.reply({
      content: 'Exibindo personagens de ' + user.username,
      embeds: [
        {
          description: list,
          thumbnail: {url: avatar},
          color: assets.sum[sum].color,
          footer: {
            text: 'Use o comando /playcard escolher <id> para escolher um personagem.',
            icon_url: user.avatarURL({
              dynamic: true,
              size: 512
            })
          }
        }
      ]
    });
  }
  async choose(interaction, id) {
    const {user} = interaction;
    const chosenCheck = await db.get(user.id + '.chosenChar');
    const list = Object.entries(await db.get(user.id + '.chars'))
      .map(([id]) => {
        return id;
      })
      .join('\n');
    if (toString(id) === toString(chosenCheck))
      return interaction.reply('Você já escolheu esse personagem como seu personagem.');
    if (!list.includes(id)) return interaction.reply('Esse personagem não existe.');
    await db.set(user.id + '.chosenChar', id);
    const chosen = await this.character(interaction, user);
    const {avatar, name} = chosen;
    return await interaction.reply({
      embeds: [
        {
          title: name,
          description: 'Você escolheu o personagem ' + name + '!',
          thumbnail: {url: avatar},
          color: assets.sum[sum].color
        }
      ]
    });
  }
}
function char(
  name,
  gender,
  personality,
  appearance,
  avatar,
  sum,
  phantom,
  equipamentos = {cabeça: {}, pescoço: {}, ombros: {}, maos: {}, peitoral: {}, cintura: {}, pernas: {}, pes: {}}
) {
  const sumSkills = {
    oscuras: {
      vitalidade: 10,
      vigor: 4,
      destreza: 5,
      mente: 0,
      forca: 10,
      resistencia: 7,
      primordio: 0,
      elemental: 0,
      profano: 0
    },

    ehrantos: {
      vitalidade: 10,
      vigor: 5,
      destreza: 0,
      mente: 7,
      forca: 0,
      resistencia: 0,
      primordio: 14,
      elemental: 0,
      profano: 0
    },
    insanata: {
      vitalidade: 10,
      vigor: 3,
      destreza: 5,
      mente: 5,
      forca: 2,
      resistencia: 5,
      primordio: 0,
      elemental: 0,
      profano: 6
    },
    observata: {
      vitalidade: 10,
      vigor: 6,
      destreza: 7,
      mente: 3,
      forca: 6,
      resistencia: 4,
      primordio: 0,
      elemental: 0,
      profano: 0
    },
    austera: {
      vitalidade: 10,
      vigor: 2,
      destreza: 2,
      mente: 4,
      forca: 0,
      resistencia: 3,
      primordio: 13,
      elemental: 0,
      profano: 0
    },
    perserata: {
      vitalidade: 10,
      vigor: 6,
      destreza: 7,
      mente: 4,
      forca: 0,
      resistencia: 2,
      primordio: 0,
      elemental: 0,
      profano: 7
    },
    equinocio: {
      vitalidade: 10,
      vigor: 6,
      destreza: 7,
      mente: 9,
      forca: 0,
      resistencia: 4,
      primordio: 0,
      elemental: 0,
      profano: 0
    },
    melancus: {
      vitalidade: 10,
      vigor: 3,
      destreza: 3,
      mente: 3,
      forca: 5,
      resistencia: 5,
      primordio: 0,
      elemental: 3,
      profano: 4
    }
  };

  return {
    name: name,
    gender: gender,
    personality: personality,
    appearance: appearance,
    avatar: avatar,
    sum: sum,
    phantom: phantom,
    skills: sumSkills[sum],
    mochila: [{}],
    equipamentos: equipamentos ?? {
      cabeça: {},
      pescoço: {},
      ombros: {},
      maos: {},
      peitoral: {},
      cintura: {},
      pernas: {},
      pes: {}
    },
    armas: {
      armaPrimaria: {},
      armaSecundaria: {}
    }
  };
}
