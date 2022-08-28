import {ComponentType, InteractionType} from 'discord.js';

import {channels} from '../../util';

export const data = {
  event: 'interactionCreate',
  name: 'Cargos por seletores',
  description: 'Aquisição de cargos através de seletores.'
};

export async function execute(interaction) {
  if (interaction.channelId !== channels.rolesChannel) return;
  if (interaction.type === InteractionType.MessageComponent) {
    const possibleRoles = interaction.component.options?.map(option => option.value);
    if (!possibleRoles) return;
    await interaction.member.roles.remove(possibleRoles);
    await interaction.member.roles.add(interaction.values);
    await interaction.reply({
      ephemeral: true,
      content: `Cargos atualizados para a sua sessão de ${interaction.component.placeholder}: ${interaction.values
        .map(role => '<@&' + role + '>')
        .join(', ')}`
    });
  } else {
    const allSelectorRoles = interaction.message.components.flatMap(actionRow => {
      return actionRow.components
        .filter(component => component.type !== ComponenType.Button)
        .flatMap(selectMenu => selectMenu.options.map(option => option.value));
    });
    await interaction.member.roles.remove(allSelectorRoles);
    await interaction.reply({
      ephemeral: true,
      content: 'Todos os seus cargos relacionados a estes seletores foram removidos.'
    });
  }
}
