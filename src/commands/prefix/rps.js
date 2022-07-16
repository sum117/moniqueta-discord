import {
  Formatters,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { title } from "../../util";

const { userMention } = Formatters;

export const data = {
  event: "messageCreate",
  name: "Pedra, Papel e Tesoura",
  description: "Um jokenpô simples com botões, em javascript.",
  /**@param {Message} msg A mensagem que executou este comando*/
};

export async function execute(msg) {
  const { author, mentions, client, channel } = msg;
  let session = new Map();
  const host = author;
  const rival = mentions.users.first();
  if (!rival) return msg.reply("Você precisa mencionar alguém para jogar rps.");
  if (rival.id === client.user.id) {
    const possibleChoices = ["pedra", "papel", "tesoura"];
    const choice =
      possibleChoices[Math.floor(Math.random() * possibleChoices.length)];
    session.set(rival.id, choice);
  }
  const array = buttons("pedra", "papel", "tesoura");
  let buttonRow = new MessageActionRow().addComponents(array);

  const embed = new MessageEmbed()
    .setAuthor({
      name: host.username,
      iconURL: host.avatarURL({ dynamic: true, size: 512 }),
    })
    .setColor(3553599)
    .setThumbnail("attachment://rps.jpg")
    .addField(host.username, "Aguardando escolha...", true)
    .addField(
      rival.username,
      rival.id === client.user.id
        ? "Moniqueta já escolheu!"
        : "Aguardando escolha...",
      true
    );
  const game = await channel.send({
    content: `Pedra, Papel e Tesoura entre ${host} e ${rival} invocado!`,
    embeds: [embed],
    components: [buttonRow],
    files: ["src/commands/resources/rps.jpg"],
  });
  const filter = (button) =>
    [host.id, rival.id].includes(button.user.id) &&
    !session.get(button.user.id);
  const collector = game.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });
  collector.on("collect", (button) => {
    let index = button.user.id === host.id ? 0 : 1;

    if (session.size === 1) {
      const winConditions = new Map([
        ["pedra", "tesoura"],
        ["papel", "pedra"],
        ["tesoura", "papel"],
      ]);
      const compare = session.values().next().value;
      if (compare === button.customId)
        return button.update({
          content: "Empate!",
          embeds: [],
          components: [],
          files: [],
        });
      else {
        const current = winConditions.get(button.customId);

        session.set(button.user.id, button.customId);
        const results = `**${host.username}** escolheu: ${title(
          session.get(host.id)
        )} \n**${rival.username}** escolheu: ${title(session.get(rival.id))}`;
        return button.update({
          content:
            userMention(
              compare === current ? button.user.id : session.keys().next().value
            ) +
            " venceu!\n" +
            results,
          embeds: [],
          components: [],
          files: [],
        });
      }
    }
    session.set(button.user.id, button.customId);
    let embed = button.message.embeds[0];
    const choice = {
      name: embed.fields[index].name,
      value: "Opção selecionada!",
      inline: true,
    };

    embed.setFields(
      index === 1 ? [embed.fields[0], choice] : [choice, embed.fields[1]]
    );
    button.update({ embeds: [embed], files: [] });
  });
  function buttons(options = [arguments]) {
    const emojis = {
      pedra: "🪨",
      papel: "🧻",
      tesoura: "✂️",
    };
    if (options.constructor !== Array) options = Array.from(arguments);
    return options.map((value) => {
      return new MessageButton()
        .setCustomId(value)
        .setStyle("PRIMARY")
        .setLabel(value.charAt(0).toUpperCase() + value.slice(1))
        .setEmoji(emojis[value]);
    });
  }
}
