import {bold, quote, userMention} from '@discordjs/builders';
import {ButtonInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed} from 'discord.js';
import {db} from '../../db.js';
import {title} from '../../util';
import {assets, PlayCardBase} from './PlayCardBase.js';

export class Interaction extends PlayCardBase {
  /**
   * @param {ButtonInteraction} interaction - O botão que iniciou o painel.
   * @param {GuildMember} target - O usuário alvo da interação.
   */
  constructor(interaction) {
    super();
    this.interaction = interaction;
  }
  async handle() {
    const {interaction} = this;
    const messageToQuery = await db.get(`${interaction.guildId}.charMessages.${interaction.message.id}`);
    const fetchedTarget = await interaction.guild.members.fetch(messageToQuery);
    this.target = fetchedTarget;
    this.panel();
  }
  async panel() {
    // Quando o usuário clica no botão, um painel é aberto com as opções de interação.
    const {interaction, target} = this;

    const reply = await interaction.reply({
      fetchReply: true,
      ephemeral: true,
      content: 'Interagindo com o personagem de ' + target.user.username,
      components: [
        new MessageActionRow().addComponents(
          new MessageButton().setCustomId('profile').setLabel('Perfil').setEmoji('📝').setStyle('SECONDARY'),
          new MessageButton().setCustomId('comment').setLabel('Comentar').setEmoji('💬').setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId(`attack_${target.id}_${interaction.message.id}_${interaction.user.id}`)
            .setLabel('Atacar')
            .setEmoji('🗡️')
            .setStyle('SECONDARY'),
        ),
      ],
    });
    const action = await reply.awaitMessageComponent();
    await action.deferUpdate();
    if (action.customId === 'profile') {
      action.editReply({
        content: 'Exibindo o perfil do personagem de ' + target.user.username,
        embeds: [await this.profile()],
        components: [],
      });
    } else if (action.customId === 'comment') {
      action.editReply({
        content: 'O que você digitar a seguir será enviado como comentário para o dono do post.',
        components: [],
      });
      this.comment();
    } else if (action.customId === `attack_${target.id}_${interaction.message.id}_${interaction.user.id}`) {
      action.editReply({
        content: 'Você está atacando o personagem de ' + target.user.username,
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`ataque_fisico_${target.id}_${interaction.message.id}_${interaction.user.id}`)
              .setLabel('Ataque Físico')
              .setEmoji('⚔️')
              .setStyle('DANGER'),
          ),
        ],
      });
    }
  }

  async profile() {
    const {interaction, target} = this;
    const db = await this.character(interaction, target);
    const {name, avatar, sum, appearance, gender, phantom, skills, equipamentos, armas} = db;
    return new MessageEmbed()
      .setTitle(name)
      .setThumbnail(avatar)
      .setColor(assets.sum[sum].color)
      .setAuthor({
        name: target.user.username,
        iconURL: target.avatarURL({dynamic: true, size: 512}),
      })
      .setDescription(
        `${appearance ? appearance : 'O personagem em questão não possui descrição alguma.'}\n\n${bold(
          'Equipamentos:',
        )}\n${Object.entries(equipamentos)
          .map(
            ([key, value]) =>
              `${assets.itens[key] + ' ' + bold(title(key === 'pes' ? 'Pés' : key))}:${title(
                `${
                  typeof value === 'object'
                    ? ` ${value.num ? value.num : ''} ${title(value.tipo ? value.tipo : '')}`
                    : value !== undefined
                    ? value
                    : ''
                }`,
              )}`,
          )
          .join('\n')}\n${Object.entries(armas)
          .filter(([key]) => key !== 'equipado')
          .map(
            ([key, value]) =>
              `${assets.itens[key]} ${bold(
                title(
                  (() => {
                    switch (key) {
                      case 'armaPrimaria':
                        return 'Arma Primária';
                      case 'armaSecundaria':
                        return 'Arma Secundária';
                      default:
                        return key;
                    }
                  })(),
                ),
              )}: ${
                typeof value === 'object'
                  ? ` ${value.num ? value.num : ''} ${title(value.tipo ? value.tipo : '')}`
                  : value !== undefined
                  ? value
                  : ''
              }`,
          )
          .join('\n')}`,
      )
      .addField(
        'Genero',
        gender === 'masculino' ? '♂️ Masculino' : gender === 'feminino' ? '♀️ Feminino' : '👽 Descubra',
        true,
      )
      .addField('Soma', assets.sum[sum].emoji + ' ' + title(sum), true)
      .addField('Purgatório', assets.phantom[phantom] + ' ' + title(phantom), true);
  }
  async comment() {
    const {interaction, target} = this;
    const {user} = interaction;
    const collector = interaction.channel.createMessageCollector({
      filter: m => m.author.id === user.id,
      time: 120000,
      max: 1,
    });
    return collector.on('end', async m => {
      const [[, msg]] = m;
      const threadChannel = interaction.message.hasThread
        ? interaction.message.thread
        : await interaction.message.startThread({
            name: 'Comentários do Post',
          });
      const check = await handleWebhooks();
      const webhook = check ? check : await msg.channel.createWebhook('moniquetaHook');
      await webhook.edit({
        name: msg.author.username,
        avatar: msg.author.avatarURL({dynamic: true, size: 512}),
      });

      if (threadChannel.archived) {
        await threadChannel.setArchived(false);
        await sendMessage();
      } else await sendMessage();

      await msg.delete();

      async function sendMessage() {
        return (
          await threadChannel.members.add(target.id),
          await webhook.send({
            threadId: threadChannel.id,
            content: userMention(target.id) + '\n' + quote(msg.content),
          }),
          await threadChannel.setLocked(true),
          await threadChannel.setArchived(true)
        );
      }
      async function handleWebhooks() {
        const webhooks = await msg.channel.fetchWebhooks();
        if (webhooks.size > 6) {
          webhooks.forEach(async wh => await wh.delete());
          return false;
        } else return webhooks.first();
      }
    });
  }
}
