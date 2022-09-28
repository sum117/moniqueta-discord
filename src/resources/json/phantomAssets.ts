type PhantomAssets = {
  [key in "azul" | "branco" | "vermelho" | "ceifador" | "tempo"]: {
    color: number;
    emoji: string;
    emojiId: string;
    thumbnail: string;
    description: string;
  };
};

export const phantomAssets: PhantomAssets = {
  azul: {
    color: 0x0000ff,
    emoji: "<:fantasmaAzul:982092065523507290> ",
    get emojiId() {
      return this.emoji.replace(/[<>]/g, "").split(":")[2].replace(/ +/g, "");
    },
    get thumbnail() {
      return (
        "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
      );
    },
    description: "Uma nova chance ao ajudar na morte de uma criatura forte.",
  },
  branco: {
    color: 0xffffff,
    emoji: "<:fantasmaBranco:982092065599029268> ",
    get emojiId() {
      return this.emoji.replace(/[<>]/g, "").split(":")[2].replace(/ +/g, "");
    },
    get thumbnail() {
      return (
        "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
      );
    },
    description: "Uma nova chance com a morte do Subtrato.",
  },
  vermelho: {
    color: 0xff0000,
    emoji: "<:fantasmaVermelho:982092065989074994>",
    get emojiId() {
      return this.emoji.replace(/[<>]/g, "").split(":")[2].replace(/ +/g, "");
    },
    get thumbnail() {
      return (
        "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
      );
    },
    description: "Uma nova chance através de favores.",
  },
  ceifador: {
    color: 0x000000,
    emoji: "<:ceifador:1007356733812903986>",
    get emojiId() {
      return this.emoji.replace(/[<>]/g, "").split(":")[2].replace(/ +/g, "");
    },
    get thumbnail() {
      return (
        "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
      );
    },
    description: "Abstenha de sua essência para o bem maior.",
  },
  tempo: {
    color: 0x00ffff,
    emoji: "<:tempo:1009528558982549524>",
    get emojiId() {
      return this.emoji.replace(/[<>]/g, "").split(":")[2].replace(/ +/g, "");
    },
    get thumbnail() {
      return (
        "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
      );
    },
    description: "A dor de todos os seres vivos.",
  },
};
