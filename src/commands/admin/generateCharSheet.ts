import {CommandInteraction, Message} from 'discord.js';
import {Discord, Guard, Slash, SlashGroup} from 'discordx';

import {CharSheet} from '../../components';
import {isAdmin} from '../../guards';

enum Feedback {
  Success = 'Ficha criada com Sucesso!'
}

@Discord()
@SlashGroup({
  name: 'admin',
  description: 'Grupo de comandos para os administradores de um servidor com a moniqueta.'
})
@SlashGroup('admin')
export class ServerComponent {
  @Slash({
    name: 'criar-ficha',
    description: 'Cria uma ficha no canal onde o comando foi usado.'
  })
  @Guard(isAdmin)
  async create(interaction: CommandInteraction) {
    await interaction.deferReply({ephemeral: true});
    const charSheet = new CharSheet(interaction.channelId, interaction.client);
    const classResponse = await charSheet.generateSheet();
    if (classResponse instanceof Message) return interaction.editReply(Feedback.Success);
    return interaction.editReply(classResponse);
  }
}
