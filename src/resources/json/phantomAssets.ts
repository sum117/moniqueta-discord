type PhantomAssets = {
  [key in 'azul' | 'branco' | 'vermelho' | 'ceifador' | 'tempo']: {
    color: number;
    emoji: string;
    emojiId: string;
    description: string;
  };
};

export const phantomAssets: PhantomAssets = {
  azul: {
    color: 0x0000ff,
    emoji: '<:fantasmaAzul:982092065523507290> ',
    get emojiId() {
      return this.emoji.replace(/[<>]/, '').split(':')[2];
    },
    description: 'Uma nova chance ao ajudar na morte de uma criatura forte.',
  },
  branco: {
    color: 0xffffff,
    emoji: '<:fantasmaBranco:982092065599029268> ',
    get emojiId() {
      return this.emoji.replace(/[<>]/, '').split(':')[2];
    },
    description: 'Uma nova chance com a morte do Subtrato.',
  },
  vermelho: {
    color: 0xff0000,
    emoji: '<:Vermelho:982082685835051078>',
    get emojiId() {
      return this.emoji.replace(/[<>]/, '').split(':')[2];
    },
    description: 'Uma nova chance através de favores.',
  },
  ceifador: {
    color: 0x000000,
    emoji: '<:Ceifador:982082685889564772>',
    get emojiId() {
      return this.emoji.replace(/[<>]/, '').split(':')[2];
    },
    description: 'Abstenha de sua essência para o bem maior.',
  },
  tempo: {
    color: 0x00ffff,
    emoji: '<:Tempo:982078436166221874>',
    get emojiId() {
      return this.emoji.replace(/[<>]/, '').split(':')[2];
    },
    description: 'A dor de todos os seres vivos.',
  },
};
