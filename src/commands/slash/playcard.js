import {CommandInteraction} from 'discord.js';
import {PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {SlashCommandBuilder as SCB} from '@discordjs/builders';
import {createForm} from '../interaction/ficha.js';
import {Xp} from '../../structures/SDA/Xp.js';
export const data = new SCB()
  .setName('playcard')
  .setDescription('Interage com todas as funções do playcard.')
  .addSubcommand(send =>
    send
      .setName('enviar')
      .setDescription('Envia uma mensagem com o playcard.')
      .addStringOption(option =>
        option.setName('conteudo').setDescription('O conteúdo que será atribuído ao playcard').setRequired(true)
      )
      .addAttachmentOption(option =>
        option.setName('anexo').setRequired(false).setDescription('Um anexo para servir de imagem para seu embed.')
      )
  )
  .addSubcommand(edit =>
    edit
      .setName('editar')
      .setDescription('Edita a última ação do seu personagem.')
      .addStringOption(option =>
        option
          .setName('conteudo')
          .setDescription('O conteúdo da mensagem que substituirá o do último playcard postado.')
          .setRequired(true)
      )
  )
  .addSubcommand(remove =>
    remove
      .setName('remover')
      .setDescription('Remove a última ação (ou uma especificada) do seu personagem.')
      .addStringOption(option =>
        option.setName('link').setDescription('Link ou id da mensagem a ser removida').setRequired(false)
      )
  )
  .addSubcommand(create =>
    create
      .setName('criar')
      .setDescription('Crie um personagem de teste para avaliar as funções da Moniqueta Alpha')
      .addUserOption(option => option.setName('usuario').setRequired(false).setDescription('O usuário da ficha'))
  )
  .addSubcommand(listar => listar.setName('listar').setDescription('Lista todos os seus personagens.'))
  .addSubcommand(escolher =>
    escolher
      .setName('escolher')
      .setDescription('Escolhe um personagem para usar.')
      .addStringOption(option => option.setName('id').setRequired(true).setDescription('O id do personagem'))
  );

/** @param {CommandInteraction} interaction A opção que executou este comando*/
export async function execute(interaction) {
  if (!interaction.isCommand()) return;
  const char = new PlayCardBase();
  if (interaction.options.getSubcommand() === 'editar') {
    await interaction.deferReply({ephemeral: true});
    const content = interaction.options.getString('conteudo');
    await char.interact(interaction, 'edit', content);
    interaction.editReply({
      content: 'Playcard editado com sucesso!'
    });
  } else if (interaction.options.getSubcommand() === 'remover') {
    await interaction.deferReply({ephemeral: true});
    const MsgToRemove = interaction.options.getString('link');
    const match = MsgToRemove
      ? MsgToRemove.match(/(?:https:\/\/discord\.com\/channels\/)(?<guild>\d+)\/(?<channel>\d+)\/(?<msg>\d+)/)
      : null;
    await char.interact(interaction, 'remove', match?.groups.msg ? match?.groups.msg : undefined);
    interaction.editReply({
      content: 'Mensagem removida com sucesso!'
    });
  } else if (interaction.options.getSubcommand() === 'criar') {

    await interaction.showModal(
      createForm([
        [, 'persoNome', 'Nome do Personagem', 'SHORT', 'Não utilize títulos aqui. Ex: "O Cavaleiro da Morte"', 128],
        [, 'persoSoma', 'Soma', 'SHORT', 'Escreva o nome da soma em MINÚSCULO. Se você errar, vai dar erro.', 128],
        [, 'persoFisico', 'Características Físicas', 'PARAGRAPH', 'Peso, aparência geral, altura e etc...', 4000],
        [
          ,
          'persoHabilidade',
          'Habilidade',
          'PARAGRAPH',
          'A habilidade do personagem não irá interferir no combate.',
          4000
        ],
        [, 'persoImagem', 'Link de Imagem', 'SHORT', 'https://i.imgur.com/image.png', 500]
      ])
    );
    interaction
      .awaitModalSubmit({
        filter: modal => modal.customId === 'ficha' && interaction.user.id === modal.user.id,
        time: 10 * 60 * 1000
      })
      .then(submittedForm => {
        const char = ((inputs = [['']]) => {
          const map = new Map();
          inputs.map(([mapKey, fieldCustomId]) =>
            map.set(mapKey, submittedForm.fields.getTextInputValue(fieldCustomId))
          );
          return map;
        })([
          ['nome', 'persoNome'],
          ['soma', 'persoSoma'],
          ['fisico', 'persoFisico'],
          ['habilidade', 'persoHabilidade'],
          ['imagem', 'persoImagem']
        ]);
        const user = interaction.options.getUser('usuario') || interaction.user;
        new PlayCardBase().create(
          interaction,
          interaction.channel.id,
          {
            name: char.get('nome'),
            personality: 'Personalidade Indisponível para personagens de teste...',
            appearance: char.get('fisico'),
            avatar: char.get('imagem'),
            gender: 'genderless',
            phantom: 'vermelho',
            sum: char.get('soma')
          },
          user
        );
        submittedForm.reply('Ficha criada.');
      });
  } else if (interaction.options.getSubcommand() === 'listar') {
    char.list(interaction);
  } else if (interaction.options.getSubcommand() === 'escolher') {
    char.choose(interaction, interaction.options.getString('id'));
  } else {
    await interaction.deferReply();
    const content = interaction.options.getString('conteudo');
    const attachment = interaction.options.getAttachment('anexo');
    await char.interact(interaction, 'send', content, attachment ? attachment : undefined);
    await new Xp().passiveXp(interaction, content.length);
    interaction.deleteReply();
  }
}
