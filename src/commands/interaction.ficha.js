import {
    ModalSubmitInteraction,
    SelectMenuInteraction,
    Modal,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    TextInputComponent
} from 'discord.js';
import { channels } from '../util.js';
import { assets } from '../structures/SDA/PlayCardBase.js';
import { title } from '../util.js';
const { sum } = assets;
const sheet = new Map();
export default {
    name: 'Comando de Ficha de Personagem',
    description:
        'Gera uma ficha de personagem para a avaliação pelos administradores.',
    /**
     * @param {ModalSubmitInteraction | SelectMenuInteraction} interaction A interação que iniciou o comando.
     */
    async execute(interaction) {
        const { user, values, customId, component, channelId } = interaction;
        if (channelId !== channels.rpRegistro) return;

        switch (interaction.type) {
            case 'MESSAGE_COMPONENT':
                if (!interaction.customId.match(/soma|genero|purgatorio/))
                    return;
                if (!sheet.get(user.id)) {
                    const choices = new Map([[customId, values[0]]]);
                    sheet.set(user.id, choices);
                    return handleChoice();
                } else {
                    const choices = sheet.get(user.id);
                    choices.set(customId, values[0]);
                    sheet.set(user.id, choices);
                    if (choices.size === 3) {
                        return interaction.showModal(
                            createForm([
                                [
                                    ,
                                    'persoNome',
                                    'Nome do Personagem',
                                    'SHORT',
                                    'Não utilize títulos aqui. Ex: "O Cavaleiro da Morte"',
                                    128
                                ],
                                [
                                    ,
                                    'persoPersonalidade',
                                    'Personalidade',
                                    'PARAGRAPH',
                                    'Seja Interessante...',
                                    4000
                                ],
                                [
                                    ,
                                    'persoFisico',
                                    'Características Físicas',
                                    'PARAGRAPH',
                                    'Peso, aparência geral, altura e etc...',
                                    4000
                                ],
                                [
                                    ,
                                    'persoHabilidade',
                                    'Habilidade',
                                    'PARAGRAPH',
                                    'A habilidade do personagem não irá interferir no combate.',
                                    4000
                                ],
                                [
                                    ,
                                    'persoImagem',
                                    'Link de Imagem',
                                    'SHORT',
                                    'Envie apenas links de imagem com a extensão no final, nada mais. Ex: https://i.imgur.com/image.png',
                                    500
                                ]
                            ])
                        );
                    }
                    return handleChoice();
                }
                function handleChoice() {
                    const optionLabel = component.options.find(
                        (option) => option.value === values[0]
                    ).label;
                    return interaction.reply({
                        content: 'Selecionei ' + optionLabel + ', continue!',
                        ephemeral: true
                    });
                }
                break;
            case 'MODAL_SUBMIT':
                if (customId === 'ficha')
                    await interaction.reply({
                        ephemeral: true,
                        content:
                            '✅ Ficha enviada com sucesso! Por favor, aguarde sua aprovação. Você será notificado caso haja algum problema. Com suas DMs abertas, seu chat comigo receberá uma cópia do os administradores estão vendo.'
                    });
                const choices = sheet.get(user.id);
                const canalDeAdmin = interaction.guild.channels.cache.get(
                    channels.adminFichaRegistro
                );
                const userInput = ((inputs = [['']]) => {
                    const map = new Map();
                    inputs.map(([mapKey, fieldCustomId]) =>
                        map.set(
                            mapKey,
                            interaction.fields.getTextInputValue(fieldCustomId)
                        )
                    );
                    return map;
                })([
                    ['nome', 'persoNome'],
                    ['personalidade', 'persoPersonalidade'],
                    ['fisico', 'persoFisico'],
                    ['habilidade', 'persoHabilidade'],
                    ['imagem', 'persoImagem']
                ]);
                const embedArray = (() => {
                    const array = [
                        new MessageEmbed()
                            .setAuthor({
                                name: user.username,
                                iconURL: user.avatarURL({
                                    dynamic: true,
                                    size: 512
                                })
                            })
                            .setTitle(userInput.get('nome'))
                            .setThumbnail(userInput.get('imagem'))
                            .setColor(sum[choices.get('soma')].color)
                            .addField(
                                'Soma',
                                sum[choices.get('soma')].emoji +
                                    ' ' +
                                    title(choices.get('soma')),
                                true
                            )
                            .addField(
                                'Genero',
                                title(choices.get('genero')) === 'Masculino'
                                    ? '♂️ Masculino'
                                    : title(choices.get('genero')) ===
                                      'Feminino'
                                    ? '♀️ Feminino'
                                    : '👽 Descubra',
                                true
                            )
                            .addField(
                                'Fantasma',
                                title(choices.get('purgatorio')),
                                true
                            )
                    ];
                    userInput.forEach((value, key) => {
                        const embed = new MessageEmbed()
                            .setTitle(title(key))
                            .setColor(sum[choices.get('soma')].color)
                            .setDescription(value);
                        if (key === 'imagem')
                            embed
                                .setImage(value)
                                .setTitle('')
                                .setDescription('');
                        array.push(embed);
                    });
                    return array;
                })();
                const components = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('aprovar')
                        .setLabel('Aprovado')
                        .setEmoji('✅')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('contato')
                        .setLabel('Disputar')
                        .setEmoji('💬')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('rejeitar')
                        .setLabel('Rejeitado')
                        .setEmoji('❌')
                        .setStyle('DANGER')
                );
                canalDeAdmin.send({
                    content: `Ficha de ${user}`,
                    embeds: embedArray,
                    components: [components]
                });
                break;
        }
    }
};

/**
 *
 * @typedef {[required: boolean, customId: string, label: string, style: string, placeholder: string, maxLength: number]} FormOptions
 */
/**
 *
 * @param {Array<FormOptions>} options - Uma array do tipo {@link FormOptions} contendo os campos a serem exibidos no formulário.
 * @returns {Modal} `Modal` Um objeto do tipo {@link Modal} que representa o formulário.
 */
function createForm(options) {
    const form = new Modal()
        .setCustomId('ficha')
        .setTitle('Ficha de Personagem');
    const array = options.map((option) => {
        const [
            required = true,
            customId = '',
            label = '',
            style = '',
            placeholder = '',
            maxLength = 128
        ] = option;
        return new TextInputComponent()
            .setRequired(required)
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(style)
            .setPlaceholder(placeholder)
            .setMaxLength(maxLength);
    });
    const rows = array.map((field) =>
        new MessageActionRow().addComponents(field)
    );
    form.addComponents(rows);
    return form;
}
