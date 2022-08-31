import {PermissionFlagsBits, SlashCommandBuilder} from 'discord.js';
import {db} from '../../db.js';
const sumArray = [
  'oscuras',
  'invidia',
  'melancus',
  'perserata',
  'equinocio',
  'austera',
  'ehrantos',
  'insanata',
  'observata',
  'humano',
  'subtrato'
];
const phantomArray = ['branco', 'vermelho', 'azul', 'ceifador', 'tempo'];
const genderArray = ['masculino', 'feminino', 'descubra'];
const skillsArray = [
  'vitalidade',
  'vigor',
  'destreza',
  'mente',
  'forca',
  'resistencia',
  'primordio',
  'elemental',
  'profano'
];
const data = new SlashCommandBuilder()
  .setName('npc')
  .setDescription('Cria um npc')
  .addStringOption(option =>
    option.setName('nome').setDescription('Nome do npc').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('titulo').setDescription('Titulo do npc').setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('aparencia')
      .setDescription('Descrição do npc')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('genero')
      .addChoices(
        ...genderArray.map(gender => {
          return {name: gender, value: gender};
        })
      )
      .setDescription('Gênero do npc')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('soma')
      .addChoices(
        ...sumArray.map(sum => {
          return {name: sum, value: sum};
        })
      )
      .setDescription('Soma do npc')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('fantasma')
      .addChoices(
        ...phantomArray.map(phantom => {
          return {name: phantom, value: phantom};
        })
      )
      .setDescription('Fantasma do npc')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('personalidade')
      .setDescription('Personalidade do npc')
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName('item')
      .setDescription('O Id do item que será atribuído ao NPC')
      .setRequired(true)
  )
  .addAttachmentOption(option =>
    option.setName('avatar').setDescription('Imagem do npc').setRequired(true)
  )
  .addAttachmentOption(option =>
    option
      .setName('icone-do-titulo')
      .setDescription('Imagem do titulo do npc')
      .setRequired(true)
  );
skillsArray.map(skill =>
  data.addNumberOption(option =>
    option
      .setName(skill)
      .setDescription('Quantia de ' + skill)
      .setRequired(true)
  )
);
const dictionary = {
  nome: 'name',
  aparencia: 'appearance',
  genero: 'gender',
  soma: 'sum',
  fantasma: 'phantom',
  personalidade: 'personality'
};
export {data};

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
    return interaction.reply(
      'Você não tem permissão para executar esse comando.'
    );
  const input = Object.keys(dictionary)
    .map(key => {
      return {
        key: dictionary[key],
        value: interaction.options.getString(key)
      };
    })
    .reduce((acc, curr, index) => {
      acc[curr.key] = curr.value;
      // check if we are in the last index
      if (index === Object.keys(dictionary).length - 1) {
        delete acc['key'];
        acc.name = interaction.options.getString('nome');
      }
      return acc;
    });
  input['skills'] = skillsArray
    .map(skill => {
      return {
        name: skill,
        value: interaction.options.getNumber(skill)
      };
    })
    .reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      if (index === skillsArray.length - 1) {
        delete acc['name'];
        acc.vitalidade = interaction.options.getNumber('vitalidade');
      }
      return acc;
    });
  input.title = {};
  input.mochila = {};
  input.title.str = interaction.options.getString('titulo');
  input.title.icon = interaction.options.getAttachment('icone-do-titulo').url;
  input.avatar = interaction.options.getAttachment('avatar').url;

  const charCount = await db.get(`${interaction.user.id}.count`);
  const itemChosen = await db
    .table('server_items')
    .get(interaction.options.getNumber('item').toString());
  itemChosen.quantia = 1;
  input.mochila[interaction.options.getNumber('item').toString()] = itemChosen;
  await db.set(`${interaction.user.id}.chars.${charCount + 1}`, input);

  return interaction.reply('NPC criado com sucesso!');
}
