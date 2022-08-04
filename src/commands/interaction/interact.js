import {ButtonInteraction} from 'discord.js';
import {Combat} from '../../structures/SDA/Combat.js';
import {Interaction} from '../../structures/SDA/Interaction.js';
import {Xp} from '../../structures/SDA/Xp.js';
export const data = {
  event: 'interactionCreate',
  type: 'buttonInteraction',
  name: 'Interagir com o PlayCard',
  description: 'Interage com o playCard ao pressionar um botão azul.'
};
/** @param {ButtonInteraction} interaction - O botão que inicializou este comando. */
export async function execute(interaction) {
  if (interaction.customId === 'interact') {
    const panel = new Interaction(interaction);
    return await panel.handle();
  } else if (interaction.customId.startsWith('ataque_fisico_')) {
    const target = await interaction.guild.members.fetch(interaction.customId.split('_')[2]);
    const staticUser = await interaction.guild.members.fetch(interaction.customId.split('_')[4]);
    const combat = await new Combat(interaction, target).init(interaction, target, staticUser.id);
    return await combat.fisico();
  } else if (interaction.customId.match(/atributos|pick_skill|increment_attribute|decrement_attribute/)) {
    const XpManager = new Xp();
    return XpManager.xpPanel(interaction, interaction.customId);
  }
}
