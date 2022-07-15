import { SelectMenuInteraction } from "discord.js";
import { misc } from "../../util";
const { channels } = misc;
export default {
  name: "Cargos por seletores",
  description: "Aquisição de cargos através de seletores.",
};
/**
 * @param {SelectMenuInteraction} interaction A interação que iniciou o comando.
 */
export async function execute(interaction) {
  if (interaction.channel.id !== channels.rolesChannel) return;
  if (interaction.isSelectMenu()) {
    const possibleRoles = interaction.component.options.map(
      (option) => option.value
    );
    await interaction.member.roles.remove(possibleRoles);
    await interaction.member.roles.add(interaction.values);
    await interaction.reply({
      ephemeral: true,
      content: `Cargos atualizados para a sua sessão de ${interaction.component.placeholder
        }: ${interaction.values.map((role) => "<@&" + role + ">").join(", ")}`,
    });
  } else {
    const allSelectorRoles = interaction.message.components.flatMap(
      (actionRow) => {
        return actionRow.components
          .filter((component) => component.type != "BUTTON")
          .flatMap((selectMenu) =>
            selectMenu.options.map((option) => option.value)
          );
      }
    );
    interaction.member.roles.remove(allSelectorRoles);
    interaction.reply({
      ephemeral: true,
      content:
        "Todos os seus cargos relacionados a estes seletores foram removidos.",
    });
  }
}
