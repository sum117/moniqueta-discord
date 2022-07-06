const { db } = require("../../db");
const Discord = require("discord.js");
const { title } = require("../../util");
module.exports = class PlayCardPlayer {
  /**
   * @param {Discord.ButtonInteraction} interaction - Usuário que teve seu personagem criado
   * @param {Object} character - Objeto que contém todas as informações do personagem
   * @param {String} character.name - Nome do personagem
   * @param {String} character.gender - Gênero do personagem
   * @param {String} character.personality - Personalidade do personagem
   * @param {String} character.appearance - Aparencia do personagem
   * @param {String} character.avatar - Avatar do personagem
   * @param {('austera'|'perserata'|'insanata'|'equinocio'|'oscuras'|'ehrantos'|'melancus'|'observata'|'invidia')} character.sum - O nome da soma do personagem
   * @param {('azul'|'vermelho'|'branco')} character.phantom - O purgatório do personagem
   * @returns {Promise<Discord.Message>} `Mensagem` - A mensagem confirmando que o personagem foi criado
   */
  create(interaction, approvedChannelId, character = {}) {
    const assets = {
      sum: {
        austera: { color: 10517508, emoji: "<:Austeros:982077481702027344>" },
        perserata: { color: 550020, emoji: "<:Perserata:982078451513184306>" },
        insanata: { color: 11535364, emoji: "<:Insanata:982078436166221874>" },
        equinocio: { color: 562180, emoji: "<:Equinocio:982082685889564772>" },
        oscuras: { color: 3146828, emoji: "<:Oscuras:982082685835051078>" },
        ehrantos: { color: 15236108, emoji: "<:Ehrantos:982082685793087578>" },
        melancus: { color: 0, emoji: "<:Melancus:982082685801472060>" },
        observata: {
          color: 16777215,
          emoji: "<:Observata:982082685864378418>",
        },
        invidia: { color: 547996, emoji: "<:Invidia:982082685503696967>" },
      },
      phantom: {
        azul: "<:fantasmaAzul:982092065523507290>",
        vermelho: "<:fantasmaVermelho:982092065989074994>",
        branco: "<:fantasmaBranco:982092065599029268>",
      },
    };
    return (async () => {
      const userId = (() => {
        const [userId] = interaction.message.content.match(/\d{17,19}/) ?? [];
        if (!userId) return interaction.user.id;
        else return userId;
      })();
      const char = await db.set(`${userId}`, {
        name: character.name,
        gender: character.gender,
        personality: character.personality,
        appearance: character.appearance,
        avatar: character.avatar,
        sum: { name: character.sum, assets: assets.sum[character.sum] },
        phantom: {
          name: character.phantom,
          assets: { emoji: assets.phantom[character.phantom] },
        },
        status: {
          health: 100,
          mana: 50,
          stamina: 50,
        },
      });
      const membro = await interaction.guild.members.fetch(userId);
      console.log(userId);
      const aprovador = interaction.user;
      const canalAprovados = await interaction.guild.channels.fetch(
        approvedChannelId
      );
      return canalAprovados.send({
        content: `Ficha de ${Discord.Formatters.userMention(
          membro.user.id
        )}, aprovada por ${Discord.Formatters.userMention(aprovador.id)}`,
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(char.name)
            .setThumbnail(char.avatar)
            .setColor(char.sum.assets.color)
            .setDescription(char.appearance)
            .setAuthor({
              name: membro.user.username,
              iconURL: membro.user.avatarURL({ dynamic: true, size: 512 }),
            })
            .addField(
              "Gênero",
              char.gender === "Masculino"
                ? "♂️ Masculino"
                : char.gender === "Feminino"
                ? "♀️ Feminino"
                : "👽 Descubra",
              true
            )
            .addField(
              "Purgatório",
              char.phantom.assets.emoji + " " + title(char.phantom.name),
              true
            )
            .addField(
              "Soma",
              char.sum.assets.emoji + " " + title(char.sum.name),
              true
            ),
        ],
      });
    })();
  }
  profile(user) {
    return async () => {
      const { name, avatar, sum, appearance, chosenTrophy, status } =
        await db.get(`${user.id}`);
      const { health, mana, stamina } = status;
      return new Discord.MessageEmbed()
        .setTitle(name)
        .setThumbnail(avatar)
        .setColor(sum.assets.color)
        .setDescription(appearance)
        .setAuthor({
          name: chosenTrophy?.name ? chosenTrophy : user.username,
          iconURL: chosenTrophy?.avatar
            ? chosenTrophy?.avatar
            : user.avatarURL({ dynamic: true, size: 512 }),
        })
        .setDescription(
          `${
            appearance
              ? appearance
              : "O personagem em questão não possui descrição alguma."
          }\n\n${[
            "❤️ " + statusBar(health),
            "🧠 " + statusBar(mana),
            "🏃‍♂️ " + statusBar(stamina),
          ].join("\n")}`
        );
    };
  }
};
/*
    interact(user, action, message) {
        const package = {
            title:,
            name:,
            sum:,
            avatar:,
            faction:,
        }
        function send()
        function edit()
        function remove()
    }

    comment(target, message) {}
    show(target) {}
    list(user) {} */

/**
 * @function
 * @author Milo123459<https://github.com/Milo123459>
 * @description This progress bar logic was copied from <https://github.com/Sparker-99/string-progressbar/blob/master/index.js>, a NPM package by Sparker-99.
 */
function statusBar(current, total) {
  let percentage = current / total;
  let progress = Math.round(10 * percentage);
  let emptyProgress = 10 - progress;
  let progressText = "🟩".repeat(progress);
  let emptyProgressText = "🟥".repeat(emptyProgress);
  let bar = progressText + emptyProgressText;
  return `${bar} ${current}`;
}
