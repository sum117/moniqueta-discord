const jogador1 = {
  skills: {
    vitalidade: 40,
    força: 20,
    resistência: 25,
    vigor: 15,
    destreza: 17,
  },
  equipamentos: {
    cabeça: {
      nome: 'Capacete de Ferro',
      base: 8,
      multiplicador: {
        num: 1.75,
        tipo: 'resistência',
      },
    },
    pescoço: {
      nome: 'Amuleto de Darandur',
      base: 5,
      multiplicador: {
        num: 1.5,
        tipo: 'vigor',
      },
    },
    ombros: {
      nome: 'Mochila do Sapo Ardente',
    },
    maos: {
      nome: 'Luvas do Tanner',
      base: 3,
      multiplicador: {
        num: 1.5,
        tipo: 'destreza',
      },
    },
    peitoral: {
      nome: 'Cota de Malha',
      base: 10,
      multiplicador: {
        num: 2.5,
        tipo: 'resistência',
      },
    },
    cintura: {
      nome: 'Cinto de Explorador',
    },
    pernas: {
      nome: 'Calça de Couro',
      base: 8,
      multiplicador: {
        num: 2,
        tipo: 'resistência',
      },
    },
    pes: {
      nome: 'Botas de Couro',
      base: 5,
      multiplicador: {
        num: 1.5,
        tipo: 'resistência',
      },
    },
  },
  armas: {
    armaPrimaria: {
      nome: 'Machado de Ferro',
      base: 78,
      tipo: 'pesada',
      multiplicador: {
        num: 3.2,
        tipo: 'força',
      },
    },
    armaSecundaria: {},
  },
  /* poderes: {
        1: {
            nome: '',
            soma: 'ehrantos',
            tipo: 'suporte',
            metodo_de_obtencao: 'inerente',
            gatilho: 'ativacao',
            descricao: 'Uma correnteza de luz te banha... você sente ela viajando por dentro de suas veias, e quando menos espera, você se encontra completamente curado de seus ferimentos.',
            habilidade: async (dbBatalha, dbPersonagem) => {
                const vidaTotal = await dbPersonagem.get('vitalidade');
                const manaAtual = await dbBatalha.get('mana');
                if (manaAtual < 50) return { msg: `${dbPersonagem.name} não tem energia somática o suficiente para curar-se! Se está em apuros, é melhor fugir! Aguente firme, Ehrantos, pelo Primórdio!` }
                await dbBatalha.set('saude', vidaTotal);
                await dbBatalha.set('mana', manaAtual - 50);

                return {
                    msg: `${dbPersonagem.name} curou-se completamente pela benção do Primórdio! Viva os Ehrantos!`,
                }
            }
        },
        2: {},
        3: {},
        4: {},
        5: {},
        6: {},
    }*/
};
const jogador2 = {
  skills: {
    vitalidade: 45,
    força: 7,
    resistência: 30,
    vigor: 10,
    destreza: 25,
  },
  equipamentos: {
    cabeça: {
      nome: 'Capacete de Ferro',
      base: 8,
      multiplicador: {
        num: 1.75,
        tipo: 'resistência',
      },
    },
    pescoço: {
      nome: 'Amuleto de Darandur',
      base: 5,
      multiplicador: {
        num: 1.5,
        tipo: 'vigor',
      },
    },
    ombros: {
      nome: 'Mochila do Sapo Ardente',
    },
    maos: {
      nome: 'Luvas do Tanner',
      base: 3,
      multiplicador: {
        num: 1.5,
        tipo: 'destreza',
      },
    },
    peitoral: {
      nome: 'Cota de Malha',
      base: 10,
      multiplicador: {
        num: 2.5,
        tipo: 'resistência',
      },
    },
    cintura: {
      nome: 'Cinto de Explorador',
    },
    pernas: {
      nome: 'Calça de Couro',
      base: 8,
      multiplicador: {
        num: 2,
        tipo: 'resistência',
      },
    },
    pes: {
      nome: 'Botas de Couro',
      base: 5,
      multiplicador: {
        num: 1.5,
        tipo: 'resistência',
      },
    },
  },
  armas: {
    armaPrimaria: {
      nome: 'Arco Grande da Crono-Quebra',
      base: 100,
      tipo: 'pesada',
      multiplicador: {
        num: 5,
        tipo: 'destreza',
      },
    },
    armaSecundaria: {},
  },
};

const rng1 = 20;
const rng2 = 19;

const itemComRng = (player, item = {}, dado = 0) => {
  const resultado = item.base + item.multiplicador.num * (player.skills[item.multiplicador.tipo] * 0.2);
  const multiplicadorBase = () => {
    if (dado === 20) return 3;
    else if (dado >= 14) return 1.25;
    else return 1;
  };
  return resultado * multiplicadorBase();
};

const calculo = (origem = {}, [alvo = {}, action = '']) => {
  const dano = Object.values(alvo.armas)
    .filter(item => item.base)
    .map(item => itemComRng(origem, item, rng1))
    .reduce((a, b) => a + b, 0);

  const defesa = Object.values(alvo.equipamentos)
    .filter(item => item.base)
    .map(item => itemComRng(alvo, item, rng2))
    .reduce((a, b) => a + b, 0);
  console.log('Dano do ataque: ' + dano, 'Defesa do alvo: ' + defesa);
  const easterEgg = Math.floor(Math.random() * 100) + 1;
  if (action === 'bloqueio' && rng2 === 20)
    return {
      msg:
        easterEgg >= 90 ? 'Parry e Easter Egg. Sorte Máxima!\nhttps://youtu.be/C4gntXWPrw4' : 'Parry perfeito! PRIIIM!',
      payback: 'defesa',
    };
  else if (action === 'desvio' && rng2 === 20)
    return {
      msg:
        easterEgg >= 90
          ? 'Desvio e Easter Egg. Sorte Máxima!\nhttps://www.youtube.com/shorts/bLC4F51xLVQ'
          : 'Esquiva perfeita! VOOSH!',
      payback: 'desvio',
    };
  else return dano - defesa;
};
console.log('Dano Infligido: ' + calculo(jogador1, [jogador2, 'bloqueio']));
