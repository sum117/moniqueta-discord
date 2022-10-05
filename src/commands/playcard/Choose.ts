import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction
} from 'discord.js';
import {Discord, Slash, SlashGroup, SlashOption} from 'discordx';

import {getUser, setCurrentChar} from '../../../prisma';
import {CharEmbed} from '../../components';
import {ErrorMessage} from '../../util/ErrorMessage';

enum Feedback {
  Success = 'Você escolheu o(a) personagem com sucesso: '
}
@Discord()
@SlashGroup('playcard')
export class Playcard {
  @Slash({name: 'escolher', description: 'Escolha um personagem para jogar'})
  public async choose(
    @SlashOption({
      autocomplete: handleShowCharNames(),
      name: 'personagem',
      type: ApplicationCommandOptionType.Number,
      description: 'O primeiro nome do personagem',
      required: true
    })
    character: number,
    interaction: CommandInteraction
  ) {
    const currentChar = await setCurrentChar(character, interaction.user.id);
    if (!currentChar) return interaction.reply(ErrorMessage.CharDatabaseError);
    const embed = await new CharEmbed(interaction).profile();
    interaction.reply({content: Feedback.Success + currentChar.name, embeds: [embed]});
  }
}

export function handleShowCharNames() {
  return function (interaction: AutocompleteInteraction) {
    getUser(interaction.user.id).then(user => {
      if (!user) return interaction.respond([{name: 'N/A', value: 'N/A'}]);
      const sizeDelimiter = (text: string) => text.split(' ')[0].slice(0, 98);
      const characters = user.chars.map(character => ({
        name: sizeDelimiter(character.name),
        value: character.id
      }));
      return interaction.respond(characters);
    });
  };
}
