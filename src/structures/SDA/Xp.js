import {bold} from '@discordjs/builders';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder
} from 'discord.js';

import {db} from '../../db.js';
import {statusBar} from '../../util';
import {levels} from './levels';
import {assets, PlayCardBase} from './PlayCardBase.js';
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

    function skilltoEdit() {
      const text = interaction.message.embeds[0]?.footer.text;
      const emojiOut = text?.split(':')[1]?.trim();
      return emojiOut;
    }

    const pickedSkill = () => interaction.values[0];

    const panel = () => {
      return {
        title: `Painel de Atributos de ${character.name}`,
        description: `Pontos disponiveis: ${character?.attributePoints ?? 0}`,
        color:
          character.phantom === 'ceifador'
            ? 5592405
            : assets.sum[character.sum].color,
        fields: Object.entries(character.skills).map(([key, value]) => {
          return {
            name: friendlyDisplay(key),
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
    };
    const staticPanel = panel();
    let editField = staticPanel.fields.find(
      field => friendlyDisplay(skilltoEdit()) === field.name
    );
    let option = interaction.message.components[0].components[0].options?.find(
      option => option.value === skilltoEdit()
    );
    switch (action) {
      case 'pick_skill':
        if (character.skills[pickedSkill()] === 117)
          return await interaction.update({
            content: 'Você já possui o nível máximo nesta habilidade.'
          });

        staticPanel.footer.text = 'Editando o atributo de: ' + pickedSkill();
        let actionRows = interaction.message.components;

        actionRows[1].components = actionRows[1].components.map(component =>
          ButtonBuilder.from(component).setDisabled(false)
        );
        return await interaction.update({
          embeds: [staticPanel],
          components: [...actionRows]
        });

      case 'increment_attribute':
        if (character.attributePoints > 0) {
          character.attributePoints--;
          character.skills[skilltoEdit()]++;
          option.description =
            'Nivel Atual: ' + character.skills[skilltoEdit()];
          staticPanel.description = staticPanel.description.replace(
            /\d+/g,
            character.attributePoints
          );
          staticPanel.footer.text = interaction.message.embeds[0].footer.text;
          editField.value = `${bold(
            character.skills[skilltoEdit()]
          )} ${statusBar(
            character.skills[skilltoEdit()],
            117,
            sortStatusBar(editField.name.split(' ')[1].trim().toLowerCase()),
            '<:BarEmpty:994631056378564750>',
            10
          )} **117**`;
          await updateDb(interaction.user.id, character);
          return await interaction.update({
            embeds: [staticPanel],
            components: [...interaction.message.components]
          });
        }

        return await interaction.update({
          content: '❌ Você não possui pontos para aumentar os atributos.'
        });

      case 'decrement_attribute':
        if (character.skills[skilltoEdit()] > 0) {
          character.attributePoints++;
          character.skills[skilltoEdit()]--;
          option.description =
            'Nivel Atual: ' + character.skills[skilltoEdit()];
          staticPanel.description = staticPanel.description.replace(
            /\d+/g,
            character.attributePoints
          );
          staticPanel.footer.text = interaction.message.embeds[0].footer.text;
          editField.value = `${bold(
            character.skills[skilltoEdit()]
          )} ${statusBar(
            character.skills[skilltoEdit()],
            117,
            sortStatusBar(editField.name.split(' ')[1].trim().toLowerCase()),
            '<:BarEmpty:994631056378564750>',
            10
          )} **117**`;
          await updateDb(interaction.user.id, character);
          return await interaction.update({
            embeds: [staticPanel],
            components: [...interaction.message.components]
          });
        }
        return await interaction.update({
          content: '❌ Você não possui niveis nos atributos para diminuir.'
        });
      default:
        return await interaction.update({
          fetchReply: true,
          ephemeral: true,
          embeds: [panel()],
          components: [
            new ActionRowBuilder().addComponents(
              new SelectMenuBuilder()
                .setCustomId('pick_skill')
                .setPlaceholder('Selecione uma habilidade...')
                .setMaxValues(1)
                .setMinValues(1)
                .setOptions(
                  Object.entries(character.skills).map(([key, value]) => {
                    return {
                      label: friendlyDisplay(key).split(' ')[1],
                      value: key,
                      emoji: assets.skills[key],
                      description: 'Nivel Atual: ' + value
                    };
                  })
                )
            ),
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('increment_attribute')
                .setEmoji('➕')
                .setLabel('Aumentar')
                .setDisabled(true)
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('decrement_attribute')
                .setEmoji('➖')
                .setLabel('Diminuir')
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger)
            )
          ]
        });
    }
  }
  async passiveXp(interaction, count) {
    const user = interaction?.author ?? interaction.user;
    const character = await this.character(interaction, user);
    const totalXp = character?.xpCount;
    const level = character?.level;
    const sentLetters = count + (character?.xpLog ?? 0);
    const attributePoints = character?.attributePoints ?? 0;

    if (!attributePoints) character.attributePoints = 0;
    if (!totalXp) character.xpCount = 0;
    if (!level) character.level = 1;
    if (!sentLetters) character.xpLog = 0;

    const xp = levels[level];

    if (sentLetters >= xp) {
      character.level++;
      character.xpLog = sentLetters - xp;
      character.xpCount += count;
      character.attributePoints = character.attributePoints + 2;
      const msg = await interaction.channel.send(
        `🎊 ${bold(
          character.name.toUpperCase()
        )} SUBIU DE NÍVEL, PARABÉNS! 🎊\nNivel Atual: ${
          character.level - 1
        }\nXP Total: ${totalXp}\nXP para o próximo nível: ${
          levels[character.level]
        }`
      );
      setTimeout(
        () =>
          msg
            .delete()
            .catch(err =>
              console.log(`A mensagem de nível já foi deletada: ${err}`)
            ),
        10000
      );
    } else {
      character.xpLog = sentLetters;
      character.xpCount += count;
    }

    await updateDb(user.id, character);
    await fixBrokenLevels();
  }
}

function friendlyDisplay(key) {
  if (!key) return;
  switch (key) {
    case 'resistencia':
      return '🛡️ RESISTÊNCIA';
    case 'forca':
      return '💪 FORÇA';
    default:
      return `${assets.skills[key]} ${key.toUpperCase()}`;
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
  const currentCharacter = await db.get(userId + '.chosenChar');
  return await db.set(`${userId}.chars.${currentCharacter}`, char);
}

export async function fixBrokenLevels() {
  (await db.all())
    .filter(entry => entry.id !== '976870103125733388')
    .forEach(entry => {
      const user = entry.id;
      const perso = entry?.value?.chars;
      if (!perso) return;
      Object.entries(perso)
        .filter(([, char]) => {
          if (char?.level) return char;
          else return;
        })
        .forEach(([id, char]) => {
          const getCorrectInfo = () =>
            new Promise(resolve => {
              Object.values(levels).reduce((a, b, i) => {
                if (a > +char?.xpCount) {
                  return resolve({
                    lvlCorreto: i,
                    xpCorreta: a - b
                  });
                }
                return a + b;
              }, 0);
            });

          getCorrectInfo().then(async ({lvlCorreto}) => {
            char.level = lvlCorreto;
            const total = lvlCorreto * 2 + 36;
            const skills = Object.values(char?.skills).reduce(
              (a, b) => a + b,
              0
            );

            if (total > skills) char.attributePoints = total - skills;

            db.set(`${user}.chars.${id}`, char);
          });
        });
    });
}
