import {bold, quote, userMention} from '@discordjs/builders';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

import {db} from '../../db.js';
import {statusBar, title} from '../../util';
import {levels} from './levels';
import {assets, PlayCardBase} from './PlayCardBase.js';

export class Interaction extends PlayCardBase {
  /**
   * @param {import('discord.js').ButtonInteraction} interaction - O botão que iniciou o painel.
   * @param {GuildMember} target - O usuário alvo da interação.
   */
  constructor(interaction, target) {
    super();
    this.interaction = interaction;
    this.target = target;
  }

  async panel(action) {
    // Quando o usuário clica no botão, um painel é aberto com as opções de interação.
    const {interaction, target} = this;

    if (action === 'profile') {
      return interaction.editReply({
        content: 'Exibindo o perfil do personagem de ' + target.user.username,
        embeds: [await this.profile()],
        components: []
      });
    } else if (action === 'comment') {
      await db.set(`${interaction.user.id}.isEditting`, true);
      await interaction.editReply({
        content:
          'O que você digitar a seguir será enviado como comentário para o dono do post.',
        components: []
      });
      return this.comment();
    } else if (
      action ===
      `attack_${target.id}_${interaction.message.id}_${interaction.user.id}`
    ) {
      return interaction.editReply({
        content: 'Você está atacando o personagem de ' + target.user.username,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(
                `ataque_fisico_${target.id}_${interaction.message.id}_${interaction.user.id}`
              )
              .setLabel('Ataque Físico')
              .setEmoji('⚔️')
              .setStyle(ButtonStyle.Danger)
          )
        ]
      });
    } else if (action === 'charEditor') {
      await this.charEditor();
    } else {
      const replyObject = {
        content: 'Interagindo com o personagem de ' + target.user.username,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('atributos')
              .setLabel('Atributos')
              .setEmoji('📈')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(interaction.user.id !== target.id),
            new ButtonBuilder()
              .setCustomId('profile')
              .setLabel('Perfil')
              .setEmoji('📝')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('comment')
              .setLabel('Comentar')
              .setEmoji('💬')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(
                `attack_${target.id}_${interaction.message.id}_${interaction.user.id}`
              )
              .setLabel('Atacar')
              .setEmoji('🗡️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(interaction.user.id === target.user.id)
          )
        ]
      };
      if (interaction.user.id === target.id)
        replyObject.components[0].components.push(
          new ButtonBuilder()
            .setCustomId('charEditor')
            .setLabel('Editar Personagem')
            .setEmoji('🖊️')
            .setStyle(ButtonStyle.Secondary)
        );

      if (!interaction.replied || !interaction.deferred) {
        await interaction.deferReply({ephemeral: true});
        return interaction.editReply(replyObject);
      } else await interaction.editReply(replyObject);
    }
  }

  async profile() {
    const {interaction, target} = this;
    const db = await this.character(interaction, target);
    const {name, avatar, sum, appearance, gender, phantom, skills} = db;
    const xpLog = db?.xpLog ?? 1;
    const totalXp = db?.xpCount ?? 0;
    const level = db?.level ?? 1;
    const nextLevelXp = levels[level] === 0 ? 4089 : levels[level];
    return new EmbedBuilder()
      .setTitle(name)
      .setThumbnail(avatar)
      .setColor(assets.sum[sum].color)
      .setAuthor({
        name: target.user.username,
        iconURL: target.displayAvatarURL({dynamic: true, size: 512})
      })
      .setDescription(
        `${
          appearance
            ? appearance
            : 'O personagem em questão não possui descrição alguma.'
        }\n\n${bold('PROGRESSO')}\n${level} ${statusBar(
          xpLog,
          nextLevelXp,
          '<:barEnergy:994630956180840529>',
          '<:BarEmpty:994631056378564750>',
          10
        )} ${level + 1}\n\n${bold('XP TOTAL:')} ${totalXp}`
      )
      .addFields(
        {
          name: 'Atributos',
          value: Object.entries(skills)
            .map(([key, value]) => {
              return `${assets.skills[key]} ${bold(
                title(
                  (() => {
                    switch (key) {
                      case 'forca':
                        return 'força';
                      case 'resistencia':
                        return 'resistência';
                      default:
                        return key;
                    }
                  })()
                )
              )}: ${value}`;
            })
            .join('\n'),
          inline: true
        },

        {
          name: 'Genero',
          value:
            gender === 'masculino'
              ? '♂️ Masculino'
              : gender === 'feminino'
              ? '♀️ Feminino'
              : '👽 Descubra',
          inline: true
        },
        {
          name: 'Soma',
          value: assets.sum[sum].emoji + ' ' + title(sum),
          inline: true
        },
        {
          name: 'Purgatório',
          value: assets.phantom[phantom] + ' ' + title(phantom),
          inline: true
        }
      );
  }

  async comment() {
    const {interaction, target} = this;
    const {user} = interaction;
    const collector = interaction.channel.createMessageCollector({
      filter: m => m.author.id === user.id,
      time: 120000,
      max: 1
    });
    return collector.on('end', async m => {
      if (!m.first()) return;
      const msg = m.first();
      const threadChannel = interaction.message.hasThread
        ? interaction.message.thread
        : await interaction.message.startThread({
            name: 'Comentários do Post'
          });
      const check = await handleWebhooks();
      const webhook = check
        ? check
        : await msg.channel.createWebhook({
            name: 'moniquetaHook',
            avatar: user.displayAvatarURL({dynamic: true, size: 512}),
            reason: 'Comentário do Post'
          });
      await webhook.edit({
        name: msg.author.username,
        avatar: msg.author.avatarURL({dynamic: true, size: 512})
      });

      if (threadChannel.archived) {
        await threadChannel.setArchived(false);
        await sendMessage();
      } else await sendMessage();

      await msg.delete();

      async function sendMessage() {
        await db.set(`${user.id}.isEditting`, false);
        await threadChannel.members.add(target.id);
        await webhook.send({
          threadId: threadChannel.id,
          content: userMention(target.id) + '\n' + quote(msg.content)
        });
        await threadChannel.setLocked(true);
        await threadChannel.setArchived(true);
      }

      async function handleWebhooks() {
        const webhooks = await msg.channel.fetchWebhooks();
        if (msg.channel.isThread())
          return msg.reply(
            'É esperado que você saiba que é impossível criar uma thread dentro de outra. Por favor... não tente fazer isso novamente.'
          );
        if (webhooks.size > 6) {
          webhooks.map(async wh => await wh.delete());
          return false;
        } else return webhooks.first();
      }
    });
  }

  async charEditor() {
    const {interaction, target} = this;
    const {id: userId} = interaction.user;
    const {id: targetId} = target;
    if (userId !== targetId)
      return interaction.editReply(
        'Você não pode editar o personagem de outra pessoa.'
      );

    const character = await this.character(interaction, target);
    let {name, appearance, avatar, personality, sum} = character;
    let chosenChar = await db.get(`${userId}.chosenChar`);
    let embed = new EmbedBuilder()
      .setTitle('Editor para ' + name)
      .setColor(assets.sum[sum].color)
      .setImage(avatar)
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({dynamic: true, size: 512})
      })
      .addFields(
        {
          name: 'Nome',
          value: name
        },
        {
          name: 'Descrição Física',
          value: appearance.slice(0, 1021) + '...'
        },
        {
          name: 'Personalidade',
          value: personality.slice(0, 1021) + '...'
        }
      );
    const editorReplyObject = {
      content: 'Editando personagem...',
      embeds: [embed],
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setCustomId('name')
            .setLabel('Editar Nome')
            .setEmoji('🖊️')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('avatar')
            .setLabel('Editar Avatar')
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('appearance')
            .setLabel('Editar Descrição')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('personality')
            .setLabel('Editar Personalidade')
            .setEmoji('🤔')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('cancelar')
            .setEmoji('❌')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Danger)
        )
      ]
    };

    await interaction.editReply(editorReplyObject);
    const possibilities = [
      'name',
      'avatar',
      'appearance',
      'personality',
      'title',
      'cancelar'
    ];
    const componentCollector =
      interaction.channel.createMessageComponentCollector({
        filter: btn =>
          btn.user.id === interaction.user.id &&
          possibilities.includes(btn.customId),
        time: 120000,
        max: 1
      });
    componentCollector.on('collect', async btn => {
      await db.set(`${btn.user.id}.isEditting`, true);
      setTimeout(() => db.set(`${btn.user.id}.isEditting`, false), 120000);
    });
    return componentCollector.on('end', async btn => {
      if (btn.size < 1) return;
      const [[_messageId, button]] = btn;
      if (!button) return;
      if (button.customId === 'cancelar')
        return interaction.editReply({
          content: 'Edição cancelada.',
          embeds: [],
          components: []
        });

      const responses = {
        name: 'Digite o novo nome do personagem:',
        avatar: 'Envie um novo link para o avatar do seu personagem:',
        appearance: 'Digite a nova descrição física do personagem:',
        personality: 'Digite a nova personalidade do personagem:',
        title: 'Digite o novo título do personagem:'
      };
      await button.deferReply({ephemeral: true});
      await button.editReply({content: responses[button.customId]});

      let msgCollector = button.channel.createMessageCollector({
        filter: msg => msg.author.id === button.user.id,
        time: 10 * 60 * 1000,
        max: 1
      });

      return msgCollector.on('end', async msgs => {
        if (msgs.size < 1)
          return interaction.editReply({content: 'Você não editou a tempo.'});
        let [[_msgId, msg]] = msgs;
        await db.set(
          `${msg.author.id}.chars.${chosenChar}.${button.customId}`,
          msg.content
        );
        const dictionary = {
          name: 'Nome',
          appearance: 'Descrição Física',
          personality: 'Personalidade'
        };
        if (msg.content.includes('https://'))
          embed.data.image.url = msg.content;
        let field =
          embed.data.fields.find(f => f.name === dictionary[button.customId]) ??
          {};
        if (field?.name !== 'Título' || field?.name !== 'Nome')
          field.value = msg.content.slice(0, 1021) + '...';
        else field.value = msg.content.slice(0, 1021);
        if (!interaction.isRepliable()) return;
        await button.editReply(
          (field.name ? field.name : 'Imagem ') +
            ' atualizado(a) com sucesso para: ' +
            field.value
        );
        await interaction.editReply({embeds: [embed]});
        await msg.delete();
        await this.charEditor();
      });
    });
  }
}
