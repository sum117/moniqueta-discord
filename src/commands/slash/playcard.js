import {
  bold,
  SlashCommandBuilder as SCB,
  userMention
} from '@discordjs/builders';
import {EmbedBuilder, InteractionType} from 'discord.js';
import fs from 'fs';
import YAML from 'yaml';

import {db} from '../../db.js';
import {assets, PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {delay} from '../../util';

export const data = new SCB()
  .setName('playcard')
  .setDescription('Interage com todas as funções do playcard.')
  .addSubcommand(edit =>
    edit
      .setName('editar')
      .setDescription('Edita a última ação do seu personagem.')
  )
  .addSubcommand(remove =>
    remove
      .setName('remover')
      .setDescription(
        'Remove a última ação (ou uma especificada) do seu personagem.'
      )
      .addStringOption(option =>
        option
          .setName('link')
          .setDescription('Link ou id da mensagem a ser removida')
          .setRequired(false)
      )
  )

  .addSubcommand(listar =>
    listar
      .setName('listar')
      .setDescription('Lista todos os seus personagens.')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('Usuário para listar os personagens.')
          .setRequired(false)
      )
  )
  .addSubcommand(escolher =>
    escolher
      .setName('escolher')
      .setDescription('Escolhe um personagem para usar.')
      .addStringOption(option =>
        option
          .setName('id')
          .setRequired(true)
          .setDescription('O id do personagem')
      )
  )
  .addSubcommand(top =>
    top.setName('top').setDescription('Mostra o top de xp do playcard')
  );

/** @param {CommandInteraction} interaction A opção que executou este comando*/
export async function execute(interaction) {
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  const char = new PlayCardBase();
  if (interaction.options.getSubcommand() === 'editar') {
    await interaction.deferReply({ephemeral: true});
    await interaction.followUp({
      content: 'Você tem um minuto para editar a mensagem.',
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 60000,
      max: 1
    });
    await db.set(`${interaction.user.id}.isEditting`, true);
    collector.on('collect', async m => {
      if (m) {
        await char.interact(m, 'edit', m.content);
        await db.set(`${m.author.id}.isEditting`, false);
        await m
          .delete()
          .catch(
            () =>
              new Error(
                'A mensagem não pode ser deletada pois não existe: playcard.js:45'
              )
          );
      }
      return interaction.editReply({
        content: 'Playcard editado com sucesso.'
      });
    });
    collector.on('end', async collected => {
      if (collected.size < 1) {
        await db.set(`${interaction.user.id}.isEditting`, false);
        return await interaction.editReply({
          content: 'Você não editou a mensagem a tempo.'
        });
      }
    });
  } else if (interaction.options.getSubcommand() === 'remover') {
    await interaction.deferReply({ephemeral: true});
    const MsgToRemove = interaction.options.getString('link');
    const match = MsgToRemove
      ? MsgToRemove.match(
          /https:\/\/discord\.com\/channels\/(?<guild>\d+)\/(?<channel>\d+)\/(?<msg>\d+)/
        )
      : null;
    await char.interact(
      interaction,
      'remove',
      match?.groups.msg ? match?.groups.msg : undefined
    );
    await interaction.editReply({
      content: 'Mensagem removida com sucesso!'
    });
  } else if (interaction.options.getSubcommand() === 'listar') {
    await char.list(
      interaction,
      interaction.options.getUser('user')
        ? interaction.options.getUser('user').id
        : interaction.user.id
    );
  } else if (interaction.options.getSubcommand() === 'escolher') {
    await char.choose(interaction, interaction.options.getString('id'));
  } else if (interaction.options.getSubcommand() === 'top') {
    let topChar;
    const characters = await db.all();
    const updatedArray = characters
      .filter(entry => {
        return (
          entry.id !== '976870103125733388' && !entry.id.startsWith('msgTop_')
        );
      })
      .map(entry => {
        const perso = entry?.value?.chars;
        if (!perso) return;
        return Object.values(entry.value.chars)
          .filter(char => {
            if (char?.xpCount) return char;
          })
          .map(char => {
            return {
              xp: char?.xpCount ?? 0,
              user: entry.id ?? 0,
              char: char ?? 0
            };
          })
          .sort((entryAfter, entryBefore) => entryBefore.xp - entryAfter.xp)
          .shift();
      })
      .sort((entryAfter, entryBefore) => entryBefore.xp - entryAfter.xp)
      .splice(0, 15)
      .map((entry, index) => {
        if (entry?.char === 0) return;
        if (entry?.user === 0) return;
        if (entry?.xp === 0) return;
        let msg = `${assets.sum[entry?.char.sum].emoji} ${
          entry?.char?.level ?? 1
        } ${entry?.char.name} (${userMention(entry?.user)}):  ${entry?.xp}`;
        switch (index) {
          case 0:
            const {Combate} = YAML.parse(
              fs.readFileSync('./src/structures/SDA/falas.yaml', 'utf8')
            );
            topChar = {
              avatar: entry?.char.avatar,
              name: entry?.char.name,
              color: assets.sum[entry?.char.sum]?.color ?? 'RANDOM',
              frases: Combate[entry?.char.sum].hp.inimigo,
              emoji: assets.sum[entry?.char.sum].emoji
            };
            return (msg = '');
          case 1:
            return (msg = '🥈 **•**' + msg);
          case 2:
            return (msg =
              '🥉 **•**' +
              msg +
              '\n\n------------------------------------------------------------\n');
          default:
            return (msg = bold(index + 1 + ' • ') + msg);
        }
      })
      .join('\n');
    await interaction.deferReply();
    do {
      await delay(1);
    } while (topChar === undefined);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: '🏆 Top 15 Personagens do Servidor 🏆',
            iconURL: interaction.guild.iconURL({dynamic: true, size: 512})
          })
          .setTitle(`👑 ${topChar.name} 👑`)
          .setDescription(
            updatedArray +
              '\n\n\n' +
              topChar.emoji +
              bold(
                topChar.frases[
                  Math.floor(Math.random() * topChar.frases.length)
                ]
              )
          )
          .setColor(topChar.color)
          .setImage(topChar.avatar)
      ]
    });
  }
}