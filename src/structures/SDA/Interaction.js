import {bold, quote, userMention} from '@discordjs/builders';
import {ButtonInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed} from 'discord.js';
import {db} from '../../db.js';
import {statusBar, title} from '../../util';
import {assets, PlayCardBase} from './PlayCardBase.js';
import {levels} from './levels';
export class Interaction extends PlayCardBase {
  /**
   * @param {ButtonInteraction} interaction - O botão que iniciou o painel.
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
        content: 'O que você digitar a seguir será enviado como comentário para o dono do post.',
        components: []
      });
      return this.comment();
    } else if (action === `attack_${target.id}_${interaction.message.id}_${interaction.user.id}`) {
      return interaction.editReply({
        content: 'Você está atacando o personagem de ' + target.user.username,
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`ataque_fisico_${target.id}_${interaction.message.id}_${interaction.user.id}`)
              .setLabel('Ataque Físico')
              .setEmoji('⚔️')
              .setStyle('DANGER')
          )
        ]
      });
    } else {
      await interaction.reply({
        fetchReply: true,
        ephemeral: true,
        content: 'Interagindo com o personagem de ' + target.user.username,
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId('atributos')
              .setLabel('Atributos')
              .setEmoji('📈')
              .setStyle('SECONDARY')
              .setDisabled(interaction.user.id === target.id ? false : true),
            new MessageButton().setCustomId('profile').setLabel('Perfil').setEmoji('📝').setStyle('SECONDARY'),
            new MessageButton().setCustomId('comment').setLabel('Comentar').setEmoji('💬').setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId(`attack_${target.id}_${interaction.message.id}_${interaction.user.id}`)
              .setLabel('Atacar')
              .setEmoji('🗡️')
              .setStyle('SECONDARY')
          )
        ]
      });
    }
  }

  async profile() {
    const {interaction, target} = this;
    const db = await this.character(interaction, target);
    const {name, avatar, sum, appearance, gender, phantom, skills, equipamentos, armas} = db;
    const xpLog = db?.xpLog ?? 1;
    const totalXp = db?.xpCount ?? 0;
    const level = db?.level ?? 1;
    const nextLevelXp = levels[level] === 0 ? 4089 : levels[level];
    return new MessageEmbed()
      .setTitle(name)
      .setThumbnail(avatar)
      .setColor(assets.sum[sum].color)
      .setAuthor({
        name: target.user.username,
        iconURL: target.displayAvatarURL({dynamic: true, size: 512})
      })
      .setDescription(
        `${appearance ? appearance : 'O personagem em questão não possui descrição alguma.'}\n\n${bold(
          'PROGRESSO'
        )}\n${level} ${statusBar(
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
          value: gender === 'masculino' ? '♂️ Masculino' : gender === 'feminino' ? '♀️ Feminino' : '👽 Descubra',
          inline: true
        },
        {name: 'Soma', value: assets.sum[sum].emoji + ' ' + title(sum), inline: true},
        {name: 'Purgatório', value: assets.phantom[phantom] + ' ' + title(phantom), inline: true}
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
      const [[, msg]] = m;
      const threadChannel = interaction.message.hasThread
        ? interaction.message.thread
        : await interaction.message.startThread({
            name: 'Comentários do Post'
          });
      const check = await handleWebhooks();
      const webhook = check ? check : await msg.channel.createWebhook('moniquetaHook');
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
        return (
          await threadChannel.members.add(target.id),
          await webhook.send({
            threadId: threadChannel.id,
            content: userMention(target.id) + '\n' + quote(msg.content)
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
