import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder as SCB
} from 'discord.js';

import {db} from '../../db.js';
import {Item} from '../../structures/SDA/Item.js';
import {title} from '../../util/index.js';

export const data = new SCB()
  .setName('item')
  .setDescription('interage com quase tudo dos itens dos playcards')
  .addSubcommand(criar =>
    criar
      .setName('criar')
      .setDescription('cria um item para o servidor.')
      .addStringOption(option =>
        option
          .setName('slot')
          .setRequired(true)
          .addChoices(
            {name: 'arma', value: 'arma'},
            {name: 'cabeça', value: 'cabeça'},
            {name: 'pescoço', value: 'pescoço'},
            {name: 'ombros', value: 'ombros'},
            {name: 'peitoral', value: 'peitoral'},
            {name: 'cintura', value: 'cintura'},
            {name: 'pernas', value: 'pernas'},
            {name: 'pes', value: 'pes'},
            {name: 'maos', value: 'maos'}
          )
          .setDescription('O slot onde o item vai ficar alocado')
      )
      .addStringOption(option =>
        option
          .setName('nome')
          .setRequired(true)
          .setDescription('o nome do item')
      )
      .addStringOption(option =>
        option
          .setName('desc')
          .setRequired(true)
          .setDescription('o descricao do item')
      )

      .addStringOption(option =>
        option
          .setName('tipo')
          .setRequired(true)
          .addChoices(
            {name: 'arma', value: 'arma'},
            {name: 'equipamento', value: 'equipamento'},
            {name: 'consumivel', value: 'consumivel'},
            {name: 'outro', value: 'outro'}
          )
          .setDescription('o tipo do item')
      )
      .addStringOption(option =>
        option
          .setName('multiplicador_tipo')
          .setDescription('O tipo do multiplicador do item')
          .setRequired(true)
          .addChoices(
            {name: 'vitalidade', value: 'vitalidade'},
            {name: 'forca', value: 'forca'},
            {name: 'resistencia', value: 'resistencia'},
            {name: 'vigor', value: 'vigor'},
            {name: 'destreza', value: 'destreza'},
            {name: 'primordio', value: 'primordio'},
            {name: 'profano', value: 'profano'},
            {name: 'elemental', value: 'elemental'},
            {name: 'mente', value: 'mente'}
          )
      )
      .addNumberOption(option =>
        option
          .setName('multiplicador_numero')
          .setRequired(true)
          .setDescription('o multiplicador do item')
      )
      .addNumberOption(option =>
        option
          .setName('base')
          .setRequired(true)
          .setDescription('o numero que representa a base do item')
      )
      .addNumberOption(option =>
        option
          .setName('valor')
          .setRequired(true)
          .setDescription('o valor do item em moedas somaticas')
      )
  )

  .addSubcommand(deletar =>
    deletar
      .setName('deletar')
      .setDescription('deleta um item do servidor')
      .addStringOption(option =>
        option
          .setName('id')
          .setDescription('nome ou id do item')
          .setRequired(true)
      )
  )
  .addSubcommand(mostrar =>
    mostrar
      .setName('mostrar')
      .setDescription('mostre um item, esteja ele no seu inventario ou nao')
      .addStringOption(option =>
        option
          .setName('id')
          .setDescription('nome ou id do item')
          .setRequired(true)
      )
  )
  .addSubcommand(dar =>
    dar
      .setName('dar')
      .setDescription('de um item que você possui para algum usuário')
      .addStringOption(option =>
        option
          .setName('id')
          .setDescription('nome ou id do item')
          .setRequired(true)
      )
      .addNumberOption(option =>
        option
          .setName('quantidade')
          .setDescription('quantidade do item')
          .setRequired(true)
      )
      .addUserOption(option =>
        option
          .setName('usuario')
          .setRequired(true)
          .setDescription('o usuario que recebera o item.')
      )
  )
  .addSubcommand(listar =>
    listar.setName('listar').setDescription('lista todos os itens do servidor')
  );

export async function execute(interaction) {
  const command = interaction.options.getSubcommand();

  switch (command) {
    case 'criar':
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply('❌ Você não tem permissão para criar itens.');
      const slot = interaction.options.getString('slot');
      const nome = interaction.options.getString('nome');
      const desc = interaction.options.getString('desc');
      const tipo = interaction.options.getString('tipo');
      const multiplicador_tipo =
        interaction.options.getString('multiplicador_tipo');
      const multiplicador_numero = interaction.options.getNumber(
        'multiplicador_numero'
      );
      const base = interaction.options.getNumber('base');
      const valor = interaction.options.getNumber('valor');

      const item = await Item.create({
        slot,
        nome,
        desc,
        tipo,
        multiplicador: {tipo: multiplicador_tipo, num: multiplicador_numero},
        base,
        valor
      });

      return interaction.reply({embeds: [item]});

    case 'deletar':
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply('❌ Você não tem permissão para criar itens.');
      const idDelete = interaction.options.getString('id');
      const itemDeletado = await Item.delete(idDelete);

      return interaction.reply({embeds: [itemDeletado]});
    case 'mostrar':
      const idMostrar = interaction.options.getString('id');
      const itemMostrar = await Item.show(idMostrar);

      return interaction.reply({embeds: [itemMostrar]});
    case 'dar':
      const usuario = interaction.options.getUser('usuario');
      const quantidade = interaction.memberPermissions.has(
        PermissionFlagsBits.ManageGuild
      )
        ? 1
        : interaction.options.getNumber('quantidade');
      const id = interaction.options.getString('id');
      const itemDado = await Item.give(
        id,
        interaction.member,
        usuario,
        quantidade
      );

      return interaction.reply({embeds: [itemDado]});
    case 'listar':
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('item.listar.0')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬅️'),
        new ButtonBuilder()
          .setCustomId('item.listar.1')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➡️')
      );
      let itens = await db.table('server_items').all();
      itens = itens.map(
        item => `ID ${bold(item.id)}: ${title(item.value.nome)}`
      );
      itens;
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `🎒 Itens do ${interaction.guild.name} 🎒`
        })
        .setDescription(itens.slice(0, 10).join('\n'))
        .setFooter({
          text: `Página 1 de ${Math.ceil(itens.length / 10)}`
        });
      return interaction.reply({
        embeds: [embed],
        components: [buttons]
      });
  }
}
