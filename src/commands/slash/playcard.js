import {CommandInteraction} from 'discord.js';
import {PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {SlashCommandBuilder as SCB} from '@discordjs/builders';
import {createForm} from '../interaction/ficha.js';
import {Xp} from '../../structures/SDA/Xp.js';
import {db} from '../../db.js';
export const data = new SCB()
  .setName('playcard')
  .setDescription('Interage com todas as funções do playcard.')
  .addSubcommand(edit => edit.setName('editar').setDescription('Edita a última ação do seu personagem.'))
  .addSubcommand(remove =>
    remove
      .setName('remover')
      .setDescription('Remove a última ação (ou uma especificada) do seu personagem.')
      .addStringOption(option =>
        option.setName('link').setDescription('Link ou id da mensagem a ser removida').setRequired(false)
      )
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
    await interaction.followUp({content: 'Você tem um minuto para editar a mensagem.', ephemeral: true});

    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({filter, time: 60000, max: 1});
    await db.set(`${interaction.user.id}.isEditting`, true);
    collector.on('collect', async m => {
      if (m) {
        await char.interact(interaction, 'edit', m.content);
        await db.set(`${m.author.id}.isEditting`, false);
      }
      return interaction.editReply({
        content: 'Playcard editado com sucesso.'
      });
    });
    collector.on('end', async collected => {
      if (!collected.size) {
        await db.set(`${m.author.id}.isEditting`, false);
        return await interaction.editReply({
          content: 'Você não editou a mensagem a tempo.'
        });
      } else return;
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
  } else if (interaction.options.getSubcommand() === 'listar') {
    char.list(interaction);
  } else if (interaction.options.getSubcommand() === 'escolher') {
    char.choose(interaction, interaction.options.getString('id'));
  }
}
