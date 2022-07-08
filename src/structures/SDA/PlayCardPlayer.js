import {
  ButtonInteraction,
  Message,
  Formatters,
  MessageEmbed,
} from "discord.js";
import { db } from "../../db.js";
import { title, statusBar } from "../../util.js";

const { userMention } = Formatters;

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

export class PlayCardPlayer {
  constructor() {
    this.character = async (interaction, user) => {
      const chosenChar = await db.get(`${user.id}.chosenChar`)
      if (!chosenChar) {
        throw (
          await interaction.reply({
            ephemeral: true,
            content: `Não há nenhum personagem criado ou selecionado para ${user.id === interaction.user.id ? 'você' : 
          user}`,
          }),
          new Error('Erro de personagem não criado ou selecionado acionado por: ' + user.id)
        )
      } else return await db.get(`${user.id}.chars.${chosenChar}`);
    }
  }
  /**
   * @param {ButtonInteraction} - Usuário que teve seu personagem criado
   * @param {Object} character - Objeto que contém todas as informações do personagem
   * @param {String} character.name - Nome do personagem
   * @param {String} character.gender - Gênero do personagem
   * @param {String} character.personality - Personalidade do personagem
   * @param {String} character.appearance - Aparencia do personagem
   * @param {String} character.avatar - Avatar do personagem
   * @param {('austera'|'perserata'|'insanata'|'equinocio'|'oscuras'|'ehrantos'|'melancus'|'observata'|'invidia')} character.sum - O nome da soma do personagem
   * @param {('azul'|'vermelho'|'branco')} character.phantom - O purgatório do personagem
   * @returns {Promise<Message>} `Mensagem` - A mensagem confirmando que o personagem foi criado
   */
  create({ message, user, guild }, approvedChannelId, character = {}) {
    const { name, gender, personality, appearance, avatar, sum, phantom } =
      character;
    const { members, channels } = guild;

    return (async () => {
      const userId = (() => {
        const [userId] = message.content.match(/\d{17,19}/) ?? [];
        if (!userId) return user.id;
        else return userId;
      })();
      await db.set(`${userId}`, {
        name: name,
        gender: gender,
        personality: personality,
        appearance: appearance,
        avatar: avatar,
        sum: { name: sum, assets: assets.sum[sum] },
        phantom: {
          name: phantom,
          assets: { emoji: assets.phantom[phantom] },
        },
        status: {
          health: 100,
          mana: 50,
          stamina: 50,
        },
      });
      const membro = await members.fetch(userId);
      console.log(userId);
      const aprovador = user;
      const canalAprovados = await channels.fetch(approvedChannelId);
      return canalAprovados.send({
        content: `Ficha de ${userMention(
          membro.user.id
        )}, aprovada por ${userMention(aprovador.id)}`,
        embeds: [
          new MessageEmbed()
            .setTitle(name)
            .setThumbnail(avatar)
            .setColor(sum.assets.color)
            .setDescription(appearance)
            .setAuthor({
              name: membro.user.username,
              iconURL: membro.user.avatarURL({ dynamic: true, size: 512 }),
            })
            .addField(
              "Gênero",
              gender === "Masculino"
                ? "♂️ Masculino"
                : gender === "Feminino"
                ? "♀️ Feminino"
                : "👽 Descubra",
              true
            )
            .addField(
              "Purgatório",
              phantom.assets.emoji + " " + title(phantom.name),
              true
            )
            .addField("Soma", sum.assets.emoji + " " + title(sum.name), true),
        ],
      });
    })();
  }
  profile(user) {
    return async () => {
      const { name, avatar, sum, appearance, chosenTrophy, status } =
        await db.get(`${user.id}`);
      const { health, mana, stamina } = status;
      return new MessageEmbed()
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
}
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
