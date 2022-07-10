import {
    ButtonInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    GuildMember
} from 'discord.js';
import { userMention, quote } from '@discordjs/builders';
import { title } from '../../util.js';
import { PlayCardBase } from './PlayCardBase.js';
import { db } from '../../db.js';

export class Interaction extends PlayCardBase {
    /**
     * @param {ButtonInteraction} interaction - O botão que iniciou o painel.
     * @param {GuildMember} target - O usuário alvo da interação.
     */
    constructor(interaction) {
        super();
        this.interaction = interaction;
        this.target;
    }
    async handle() {
        const { interaction } = this;
        const messageToQuery = await db.get(
            `${interaction.guildId}.charMessages.${interaction.message.id}`
        );
        const fetchedTarget = await interaction.guild.members.fetch(
            messageToQuery
        );
        this.target = fetchedTarget;
        this.panel();
    }
    async panel() {
        // Quando o usuário clica no botão, um painel é aberto com as opções de interação.
        const { interaction, target } = this;

        const reply = await interaction.reply({
            fetchReply: true,
            ephemeral: true,
            content: 'Interagindo com o personagem de ' + target.user.username,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('profile')
                        .setLabel('Perfil')
                        .setEmoji('📝')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('comment')
                        .setLabel('Comentar')
                        .setEmoji('💬')
                        .setStyle('SECONDARY')
                )
            ]
        });
        const action = await reply.awaitMessageComponent();
        await action.deferUpdate();
        if (action.customId === 'profile')
            action.editReply({
                content:
                    'Exibindo o perfil do personagem de ' +
                    target.user.username,
                embeds: [await this.profile()],
                components: []
            });
        else if (action.customId === 'comment') {
            action.editReply({
                content:
                    'O que você digitar a seguir será enviado como comentário para o dono do post.',
                components: []
            });
            this.comment();
        }
    }

    async profile() {
        const { interaction, target } = this;
        const db = await this.character(interaction, target);
        const { name, avatar, sum, appearance, gender, phantom } = db;
        return new MessageEmbed()
            .setTitle(name)
            .setThumbnail(avatar)
            .setColor(sum.assets.color)
            .setAuthor({
                name: target.user.username,
                iconURL: target.avatarURL({ dynamic: true, size: 512 })
            })
            .setDescription(
                appearance
                    ? appearance
                    : 'O personagem em questão não possui descrição alguma.'
            )
            .addField(
                'Genero',
                gender === 'Masculino'
                    ? '♂️ Masculino'
                    : gender === 'Feminino'
                    ? '♀️ Feminino'
                    : '👽 Descubra',
                true
            )
            .addField('Soma', sum.assets.emoji + ' ' + title(sum.name), true)
            .addField(
                'Purgatório',
                phantom.assets.emoji + ' ' + title(phantom.name),
                true
            );
    }
    async comment() {
        const { interaction, target } = this;
        const { user } = interaction;
        const collector = interaction.channel.createMessageCollector({
            filter: (m) => m.author.id === user.id,
            time: 120000,
            max: 1
        });
        return collector.on('end', async (m) => {
            const [[, msg]] = m;
            const threadChannel = interaction.message.hasThread
                ? interaction.message.thread
                : await interaction.message.startThread({
                      name: 'Comentários do Post'
                  });
            const check = await handleWebhooks();
            const webhook = check
                ? check
                : await msg.channel.createWebhook('moniquetaHook');
            await webhook.edit({
                name: msg.author.username,
                avatar: msg.author.avatarURL({ dynamic: true, size: 512 })
            });

            if (threadChannel.archived) {
                await threadChannel.setArchived(false);
                await sendMessage();
            } else await sendMessage();

            await msg.delete();

            async function sendMessage() {
                return (
                    await webhook.send({
                        threadId: threadChannel.id,
                        content:
                            userMention(target.id) + '\n' + quote(msg.content)
                    }),
                    await threadChannel.members.add(target.id),
                    await threadChannel.setLocked(true),
                    await threadChannel.setArchived(true)
                );
            }
            async function handleWebhooks() {
                const webhooks = await msg.channel.fetchWebhooks();
                if (webhooks.size > 6) {
                    webhooks.forEach(async (wh) => await wh.delete());
                    return false;
                } else return webhooks.first();
            }
        });
    }
}
