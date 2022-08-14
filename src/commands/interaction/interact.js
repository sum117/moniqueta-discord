import {db} from '../../db.js';
import {Combat} from '../../structures/SDA/Combat.js';
import {Interaction} from '../../structures/SDA/Interaction.js';
import {Item} from '../../structures/SDA/Item.js';
import {Xp} from '../../structures/SDA/Xp.js';
export const data = {
  event: 'interactionCreate',
  type: 'buttonInteraction',
  name: 'Interagir com o PlayCard',
  description: 'Interage com o playCard ao pressionar um botão azul.'
};
let interactionPanel = new Map();
let target;
let user;
/** @param {ButtonInteraction} interaction - O botão que inicializou este comando. */
export async function execute(interaction) {
  if (interaction.customId === 'interact') {
    target = await (async () => {
      const id = await db.get(`${interaction.guildId}.charMessages.${interaction.message.id}`);
      return interaction.guild.members.fetch(id);
    })();
    interactionPanel.set(target.id, new Interaction(interaction, target));
    await interactionPanel.get(target.id).panel(interaction.customId);
  } else if (interaction.customId.match(/profile|comment|attack/)) {
    await interactionPanel.get(target.id).panel(interaction.customId);
  } else if (interaction.customId.startsWith('ataque_fisico_')) {
    target = await interaction.guild.members.fetch(interaction.customId.split('_')[2]);
    const staticUser = await interaction.guild.members.fetch(interaction.customId.split('_')[4]);

    const combat = await new Combat().init(interaction, target, staticUser.id);
    return combat.fisico();
  } else if (interaction.customId.match(/atributos|pick_skill|increment_attribute|decrement_attribute/)) {
    const XpManager = new Xp();
    return XpManager.xpPanel(interaction, interaction.customId);
  } else {
    const conditions = {
      equipar_item: interaction.customId === 'equipar_item',
      selecionar_slot: [
        'cabeça',
        'pescoço',
        'ombros',
        'maos',
        'peitoral',
        'pernas',
        'cintura',
        'pes',
        'armaPrimaria',
        'armaSecundaria'
      ].includes(interaction.customId),
      inventario: interaction.customId === 'inventario'
    };
    if (conditions.equipar_item) await Item.equipPanel(interaction, interaction.customId, user);
    else if (conditions.selecionar_slot) await Item.equipPanel(interaction, 'selecionar_slot', user);
    else if (conditions.inventario) {
      user = await Item.fetchUser(interaction);
      await Item.equipPanel(interaction, interaction.customId, user);
    }
  }
}
