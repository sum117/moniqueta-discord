import {
  ButtonInteraction,
  Interaction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  SelectMenuInteraction
} from 'discord.js';
import {assets, PlayCardBase} from './PlayCardBase.js';
import {statusBar, title} from '../../util';
import {bold} from '@discordjs/builders';
import {levels} from './levels';
export class Xp extends PlayCardBase {
  constructor() {
    super();
  }
  /**
   *
   * @param {SelectMenuInteraction | ButtonInteraction} interaction
   * @param {*} action
   * @returns
   */
  async xpPanel(interaction, action = interaction.customId ?? '') {
    const {user} = interaction;
    const character = await this.character(interaction, user);
    const skillToEdit = interaction.message.embeds[0]?.footer.text.trim().split(':')[1] ?? '';
    /**
     * @type {Interaction}
     */
    const panel = {
      title: `Painel de Atributos de ${character.name}`,
      description: `Pontos disponiveis: ${character.attributePoints ?? 0}`,
      color: assets.sum[character.sum].color,
      fields: Object.entries(character.skills).map(([key, value]) => {
        return {
          name: key.toUpperCase(),
          value: `${bold(value)} ${statusBar(
            value,
            117,
            sortStatusBar(key),
            '<:BarEmpty:994631056378564750>',
            10
          )} **117**`
        };
      }),
      footer: {
        icon_url: character.avatar,
        text: 'Clique em um atributo para aumentar ou diminuir o valor...'
      }
    };
    switch (action) {
      case 'pick_skill':
        const pickedSkill = interaction.values[0];
        if (character.skills[pickedSkill] === 117)
          return await interaction.update({content: 'Você já possui o nível máximo nesta habilidade.'});
        else {
          panel.footer.text = 'Editando o atributo de: ' + pickedSkill;
          interaction.message.components[1].components.forEach(component => (component.disabled = false));
          return await interaction.update({embeds: [panel], components: [...interaction.message.components]});
        }

      case 'increment_attribute':
        if (character.attributePoints > 0) {
          const increasedLevel = character.skills[skillToEdit] + 1;

          character.attributePoints--;
          character.skills[skillToEdit]++;

          panel.fields.find(field => field.name === skillToEdit.toUpperCase()).value = `${bold(
            increasedLevel
          )} ${statusBar(increasedLevel, 117, sortStatusBar(key), '<:BarEmpty:994631056378564750>', 10)} **117**`;
          await updateDb(interaction.user.id, character);
          return await interaction.update({embeds: [panel]});
        } else return await interaction.update({content: '❌ Você não possui pontos para aumentar os atributos.'});

      case 'decrement_attribute':
        if (character.skills[skillToEdit] > 0) {
          const decreasedLevel = character.skills[skillToEdit] - 1;

          character.attributePoints++;
          character.skills[skillToEdit]--;

          panel.fields.find(field => field.name === skillToEdit.toUpperCase()).value = `${bold(
            decreasedLevel
          )} ${statusBar(decreasedLevel, 117, sortStatusBar(key), '<:BarEmpty:994631056378564750>', 10)} **117**`;
          await updateDb(interaction.user.id, character);
          return await interaction.update({embeds: [panel]});
        } else return await interaction.update({content: '❌ Você não possui niveis nos atributos para diminuir.'});
      default:
        return await interaction.reply({
          fetchReply: true,
          ephemeral: true,
          embeds: [panel],
          components: [
            new MessageActionRow().addComponents(
              new MessageSelectMenu()
                .setCustomId('pick_skill')
                .setPlaceholder('Selecione uma habilidade...')
                .setMaxValues(1)
                .setMinValues(1)
                .setOptions(
                  Object.entries(character.skills).map(([key, value]) => {
                    return {
                      label: title(key),
                      value: key,
                      emoji: assets.skills[key],
                      description: 'Nivel Atual: ' + value
                    };
                  })
                )
            ),
            new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId('increment_attribute')
                .setEmoji('➕')
                .setLabel('Aumentar')
                .setDisabled(true)
                .setStyle('SUCCESS'),
              new MessageButton()
                .setCustomId('decrement_attribute')
                .setEmoji('➖')
                .setLabel('Diminuir')
                .setDisabled(true)
                .setStyle('DANGER')
            )
          ]
        });
    }
  }
  async passiveXp(interaction, count) {
    const {user} = interaction;
    const character = await this.character(interaction, user);
    const totalXp = character?.xpCount;
    const level = character?.level;
    const sentLetters = character?.xpLog ?? 0;

    if (!totalXp) character.xpCount = 0;
    if (!level) character.level = 1;
    if (!sentLetters) character.xpLog = 0;

    const xp = levels[level];

    if (sentLetters >= xp) {
      character.level++;
      character.xpLog = 0;
      character.attributePoints = character.attributePoints + 2;
      const msg = await interaction.channel.send(
        `🎊 ${bold(character.name.toUpperCase())} SUBIU DE NÍVEL, PARABÉNS! 🎊\nNivel Atual: ${
          character.level
        }\nXP Total: ${totalXp}\nXP para o próximo nível: ${levels[character.level]}`
      );
      setTimeout(() => msg.delete().catch(err => console.log(`A mensagem de nível já foi deletada: ${err}`)), 10000);
      this.xpPanel(interaction);
    } else character.xpLog += count;

    character.xpCount += count;
    await updateDb(user.id, character);
  }
}

function sortStatusBar(key) {
  switch (key) {
    case 'vitalidade':
      return '<:barLife:994630714312106125>';
    case 'vigor':
      return '<:barVigor:994630903181615215>';
    default:
      return '<:barEnergy:994630956180840529>';
  }
}

async function updateDb(userId, char) {
  const currentCharacter = db.get(userId + '.chosenChar');
  return await db.set(`${userId}.chars.${currentCharacter}`, char);
}
