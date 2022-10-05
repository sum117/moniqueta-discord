import {CommandInteraction} from 'discord.js';
import {Discord, Slash, SlashGroup} from 'discordx';

import {getUser, isUserFreeStyling, setUserFreeStyle} from '../../../prisma';
import {premiumRoles} from '../../resources';
import {ErrorMessage} from '../../util/ErrorMessage';

enum Feedback {
  Active = 'O FreeStyle agora está ativo, seus prefixos são: ',
  Inactive = 'O FreeStyle agora está inativo.'
}
@Discord()
@SlashGroup('playcard')
export class Playcard {
  @Slash({name: 'freestyle', description: 'Use multiplos personagens em uma mensagem'})
  public async freestyle(interaction: CommandInteraction) {
    const hasAllowedRoles = () => {
      const nitroRole = interaction.guild?.roles.cache.find(role => role.id === premiumRoles.nitro);
      const patronRole = interaction.guild?.roles.cache.find(
        role => role.id === premiumRoles.patron
      );
      if (nitroRole && patronRole) {
        return (
          nitroRole.members.has(interaction.user.id) || patronRole.members.has(interaction.user.id)
        );
      }
    };
    if (!hasAllowedRoles()) return interaction.reply(ErrorMessage.NoPremium);
    const userDatabase = await getUser(interaction.user.id);
    if (!userDatabase?.chars) return interaction.reply(ErrorMessage.CharDatabaseError);
    const charNames = userDatabase.chars.map(char => char.name.split(' ')[0]);
    const currentState = await isUserFreeStyling(interaction.user.id);
    const newState = !currentState;
    await setUserFreeStyle(interaction.user.id, newState).catch(err => {
      console.log(err);
      return interaction.reply(ErrorMessage.DatabaseError);
    });
    await interaction.reply(
      Feedback[newState ? 'Active' : 'Inactive'] + (newState ? charNames.join(', ') : '')
    );
  }
}
