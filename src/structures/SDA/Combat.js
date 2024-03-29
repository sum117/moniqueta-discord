import {bold, userMention} from '@discordjs/builders';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from 'discord.js';
import fs from 'fs';
import YAML from 'yaml';

import {db} from '../../db.js';
import {title} from '../../util';
import {PlayCardBase} from './PlayCardBase.js';

export class Combat extends PlayCardBase {
  constructor() {
    super();
  }

  async init(interaction, target, userId) {
    const {Combate} = YAML.parse(
      fs.readFileSync('./src/structures/SDA/falas.yaml', 'utf8')
    );
    // Usuário brutos
    this.userId = userId;
    this.target = await interaction.guild.members.fetch(target);
    //Personagens
    this.alvo = await this.character(interaction, target);
    this.origem = await this.character(interaction, interaction.user);
    // Falas especiais
    this.falasAlvo = Combate[this.alvo.sum];
    this.falasOrigem = Combate[this.origem.sum];
    this.interaction = interaction;
    this.batalha = await (async () => {
      const batalha = db.table('batalha');
      return (async (origem, alvo) => {
        const dbOrigem = await batalha.get(
          `${interaction.channelId}.${origem}`
        );
        const dbAlvo = await batalha.get(`${interaction.channelId}.${alvo}`);
        const conditions = {
          both: dbOrigem && dbAlvo,
          origem: dbOrigem && !dbAlvo,
          alvo: !dbOrigem && dbAlvo,
          none: !dbOrigem && !dbAlvo
        };
        if (conditions.both)
          return {db: await batalha.get(`${interaction.channelId}`)};
        if (conditions.origem) {
          await batalha.set(`${interaction.channelId}.${alvo}`, {
            saude: 100 + this.alvo.skills.vitalidade * 10,
            vigor: 50 + this.alvo.skills.vigor * 5
          });
          return {db: await batalha.get(`${interaction.channelId}`)};
        }
        if (conditions.alvo) {
          await batalha.set(`${interaction.channelId}.${origem}`, {
            saude: 100 + this.origem.skills.vitalidade * 10,
            vigor: 50 + this.origem.skills.vigor * 5
          });
          return {db: await batalha.get(`${interaction.channelId}`)};
        }
        if (conditions.none) {
          await batalha.set(`${interaction.channelId}.${alvo}`, {
            saude: 100 + this.alvo.skills.vitalidade * 10,
            vigor: 50 + this.alvo.skills.vigor * 5
          });
          await batalha.set(`${interaction.channelId}.${origem}`, {
            saude: 100 + this.origem.skills.vitalidade * 10,
            vigor: 50 + this.origem.skills.vigor * 5
          });
          return {db: await batalha.get(`${interaction.channelId}`)};
        }
      })(this.userId, this.target.id);
    })();
    return this;
  }

  async fisico() {
    const {
      alvo,
      batalha,
      origem,
      interaction,
      target,
      userId,
      falasOrigem,
      falasAlvo
    } = this;
    const ultimoPost = await db.get(`${userId}.latestMessage`);
    const charMessagesDb = await db.get(
      `${interaction.guildId}.charMessages.${
        interaction.customId.split('_')[3]
      }`
    );
    const personagemAtualAlvo = await db.get(`${target.id}.chosenChar`);
    const personagemAtualOrigem = await db.get(`${userId}.chosenChar`);
    const dadoAlvo = Math.floor(Math.random() * 20) + 1;
    const dadoOrigem = Math.floor(Math.random() * 20) + 1;

    // ------------------------------------------------ Erros de validação ------------------------------------------------
    if (
      !(
        ultimoPost?.channelId === interaction.channelId &&
        ultimoPost.time > Date.now() - 1000 * 60 * 45
      )
    )
      return interaction.reply({
        content:
          '❌ Você não pode atacar ninguém se o seu personagem não enviou um post no canal do alvo nos últimos 45 minutos.',
        ephemeral: true
      });
    if (!interaction.customId.startsWith('ataque_fisico'))
      throw new Error(
        'Você usou o método de ataque físico em uma interação incongruente.'
      );

    if (!charMessagesDb)
      return interaction.reply(
        '❌ A mensagem do alvo foi deletada, não é possível atacar.'
      );

    if (ultimoPost.token)
      return interaction.reply(
        `${userMention(
          userId
        )}, você já usou seu token de combate para este turno!`
      );

    // ------------------------------------------------ Ataque validado ------------------------------------------------
    await interaction.deferReply({fetchReply: true});
    const escolhaAlvo = await this.responsePanel(
      interaction,
      origem,
      target,
      alvo,
      userId
    );
    const resposta = calculo(
      origem,
      alvo,
      escolhaAlvo,
      dadoOrigem,
      dadoAlvo,
      batalha.db[target.id]?.esquivas
    );

    // Se o dano for maior que a vida do alvo, enviar um prompt de escolha de destino para o atacante decidir se deseja matar o alvo ou não
    if (resposta?.dano > batalha.db[target.id].saude) {
      await this.executionPanel(
        interaction,
        origem,
        alvo,
        target,
        userId,
        personagemAtualAlvo,
        personagemAtualOrigem
      );
    } else {
      await setCombatState(target.id, personagemAtualAlvo, true);
      await setCombatState(userId, personagemAtualOrigem, true);
      // Caso contrario, apenas subtraia a vida do alvo e envie uma mensagem ao canal com os dados do turno.
      const mensagem = (() => {
        let msg = '';
        if (resposta?.msg) return resposta.msg;
        else {
          if (resposta?.dano > 0)
            msg += `\n\n${bold(origem.name)} infligiu ${bold(
              resposta?.dano
            )} de dano em ${bold(alvo.name)}!`;
          else
            msg += `\n\n${bold(origem.name)} não causou dano em ${bold(
              alvo.name
            )}!`;
          if (resposta?.defesa > 0) {
            if (batalha.db[target.id].vigor > resposta?.custo)
              msg += `\n\n${bold(alvo.name)} defendeu ${bold(
                resposta?.defesa
              )} de dano!`;
            else
              msg += `\n\n${bold(
                alvo.name
              )} não defendeu nenhum dano pois está cansado(a) demais!`;
          } else if (resposta?.esquiva > 0) {
            if (batalha.db[target.id].vigor > resposta?.custo)
              msg += `\n\n${bold(alvo.name)} ignorou ${
                resposta?.esquiva
              } do ataque!`;
            else
              msg += `\n\n${bold(
                alvo.name
              )} não ignorou o ataque pois está cansado(a) demais!`;
          }

          if (resposta?.payback === 'contra_ataque' && resposta?.danoAlvo)
            msg += `\n\n${bold(
              alvo.name
            )} decidiu contra-atacar e causou ${bold(
              resposta?.danoAlvo
            )} de dano em ${origem.name}!`;
          return msg;
        }
      })();
      await interaction.editReply(mensagem);
    }

    // Administrando o dano causado no turno e os custos dos movimentos.
    if (resposta?.danoAlvo) this.setHealth(batalha, userId, -resposta.danoAlvo);
    if (batalha.db[target.id].vigor > resposta?.custo) {
      batalha.db[target.id].esquivas += 1;
      batalha.db[target.id].vigor =
        batalha.db[target.id].vigor - resposta?.custo;
      this.setHealth(batalha, target.id, -resposta?.dano);
    } else this.setHealth(batalha, target.id, -resposta?.danoTotal);
    if (resposta?.payback?.match(/defesa_perfeita|esquiva_perfeita/))
      await setCombatToken(target.id, false);
    else await setCombatToken(userId, true);

    await updateDb(interaction, batalha);
    const updatedBattle = async id => {
      return {db: await db.table('batalha').get(id)};
    };
    const updatedData = await updatedBattle(interaction.channelId);
    // Checando se o alvo ja foi avisado sobre a sua situação dificil, e enviando uma mensagem caso ainda não tenha sido
    await this.handleEffectPhrase(
      updatedData,
      target,
      alvo,
      userId,
      interaction,
      falasAlvo,
      'warned'
    );
    await this.handleEffectPhrase(
      updatedData,
      target,
      alvo,
      userId,
      interaction,
      falasAlvo,
      'vwarned'
    );
    // Se o alvo estiver perto da morte, ou sem energia, enviar uma mensagem de encorajamento para o atacante se uma não foi enviada
    await this.handleEffectPhrase(
      updatedData,
      target,
      alvo,
      userId,
      interaction,
      falasOrigem,
      'encouraged'
    );
    await this.handleEffectPhrase(
      updatedData,
      target,
      alvo,
      userId,
      interaction,
      falasOrigem,
      'vencouraged'
    );
  }

  setHealth(batalha, targetId, value) {
    return (batalha.db[targetId].saude =
      batalha.db[targetId].saude + (value ? value : 0));
  }

  async handleEffectPhrase(
    batalha,
    target,
    alvo,
    userId,
    interaction,
    falas,
    state = 'encouraged' || 'warned' || 'vwarned' || 'vencouraged'
  ) {
    if (
      ['encouraged', 'warned'].includes(state) &&
      batalha.db[target.id].saude < alvo.skills.vitalidade * 10 * 0.4 &&
      !batalha.db[userId]?.[state]
    ) {
      batalha.db[userId][state] = true;
      await updateDb(interaction, batalha);
      await interaction.channel.send({
        content: `🗣️ ${userMention(
          state === 'warned' ? target.id : userId
        )} 🗣️\n${
          falas.hp[state === 'warned' ? 'self' : 'inimigo'][
            Math.floor(
              Math.random() *
                falas.hp[state === 'warned' ? 'self' : 'inimigo'].length
            )
          ]
        }`
      });
    } else if (
      ['vencouraged', 'vwarned'].includes(state) &&
      batalha.db[target.id].vigor < alvo.skills.vigor * 5 * 0.4 &&
      !batalha.db[userId]?.[state]
    ) {
      batalha.db[userId][state] = true;
      await updateDb(interaction, batalha);
      await interaction.channel.send({
        content: `🗣️ ${userMention(
          state === 'vwarned' ? target.id : userId
        )} 🗣️\n${
          falas.vigor[state === 'vwarned' ? 'self' : 'inimigo'][
            Math.floor(
              Math.random() *
                falas.vigor[state === 'vwarned' ? 'self' : 'inimigo'].length
            )
          ]
        }`
      });
    }
  }

  async executionPanel(
    interaction,
    origem,
    alvo,
    target,
    userId,
    personagemAtualAlvo,
    personagemAtualOrigem
  ) {
    const painelFinal = await interaction.editReply({
      content: `${bold(origem.name)} derrubou ${bold(
        alvo.name
      )}!\nO destino dele(a) deverá ser decidido nos proximos dez minutos, ou morrerá de sangramento de qualquer forma!`,
      components: [
        new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId(`executar_${target.id}_${userId}`)
            .setStyle(ButtonStyle.Danger)
            .setLabel('EXECUTAR!')
            .setEmoji('🗡️'),
          new ButtonBuilder()
            .setCustomId(`poupar_${target.id}_${userId}`)
            .setStyle(ButtonStyle.Primary)
            .setLabel('POUPAR!')
            .setEmoji('🆘')
        ])
      ]
    });
    const coletorOrigem = painelFinal.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time: 60 * 10 * 1000,
      max: 1
    });

    coletorOrigem.on('collect', async button => {
      const targetId = button.customId.split('_')[1];
      const originUser = button.customId.split('_')[2];
      if (button.customId === 'executar_' + target.id + `_${userId}`) {
        await handleExecutar(button);
        await setCombatState(targetId, personagemAtualAlvo, false);
        await setCombatState(originUser, personagemAtualOrigem, false);
      } else {
        await setCombatState(targetId, personagemAtualAlvo, false);
        await setCombatState(originUser, personagemAtualOrigem, false);
        await button.message.edit({
          content: `${bold(origem.name)} poupou ${bold(alvo.name)}...`,
          components: []
        });
        await button.channel.send({
          content: `A batalha entre ${bold(origem.name)} e ${bold(
            alvo.name
          )} acabou. O vencedor é ${bold(
            origem.name
          )}, que decidiu poupar o(a) opositor(a)!`
        });
      }

      await deleteDb(interaction, targetId);
      await deleteDb(interaction, originUser);
    });
    coletorOrigem.on('end', async collected => {
      await setCombatState(target.id, personagemAtualAlvo, false);
      await setCombatState(userId, personagemAtualOrigem, false);
      if (!collected) return handleExecutar();
    });

    async function handleExecutar(btn) {
      await btn.message.edit({
        content: `${bold(origem.name)} executou ${bold(
          alvo.name
        )}... Que Sidera o(a) tenha! 💀`,
        components: []
      });

      await db.add(`${userId}.chars.${personagemAtualOrigem}.kills`, 1);
      await db.set(`${target.id}.chars.${personagemAtualAlvo}.dead`, true);
      await btn.channel.send({
        content: `💀 ${bold(alvo.name)} morreu, ${userMention(
          target.id
        )}!\n\nEm breve você poderá sair da carcaça somática e virar um fantasma. Porém, se você for um(a) ceifador(a), este personagem foi perdido para sempre!`
      });
    }
  }

  async responsePanel(interaction, origem, target, alvo, userId) {
    const painel = await interaction.channel.send({
      content: `Seu personagem foi atacado por ${bold(
        origem.name
      )}, ${userMention(target.id)}!${
        !origem.inCombat
          ? `\n💀 ${bold(
              alvo.name
            )} entrou em modo de combate. Tenha cuidado, e escolha com cautela seus próximos passos. Boa sorte, ${bold(
              title(alvo.sum)
            )}!`
          : ''
      }`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`defender_${target.id}_${userId}`)
            .setLabel('DEFESA')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🛡'),
          new ButtonBuilder()
            .setCustomId(`contra_ataque_${target.id}_${userId}`)
            .setLabel('CONTRA-ATAQUE')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🤞'),
          new ButtonBuilder()
            .setCustomId(`esquiva_${target.id}_${userId}`)
            .setLabel('ESQUIVA')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💨')
        )
      ]
    });
    return painel
      .awaitMessageComponent({
        filter: i => i.user.id === target.id,
        time: 60 * 10 * 1000,
        max: 1
      })
      .then(async reacaoAlvo => {
        await painel.edit({
          content: `${userMention(target.id)} escolheu ${bold(
            title(reacaoAlvo.component.label)
          )}!`,
          components: []
        });

        if (reacaoAlvo?.customId.startsWith('defender')) return 'defender';
        else if (reacaoAlvo?.customId.startsWith('contra_ataque'))
          return 'contra_ataque';
        else if (reacaoAlvo?.customId.startsWith('esquiva')) return 'esquiva';
      })
      .catch(async () => {
        await painel.edit({
          content: `${userMention(
            target.id
          )} não respondeu ao seu ataque no tempo estipulado. O personagem tentará defender automaticamente!`,
          components: []
        });
        return 'defender';
      });
  }
}

// ------------------------------------------------ Database functions and helpers ------------------------------------------------
async function setCombatToken(userId, bool) {
  await db.set(`${userId}.latestMessage.token`, bool);
}

/**
 * Função que define o estado de combate de um personagem
 * @param {object} target O usuário que está sendo administrado
 * @param {object} personagemAtual O personagem que está sendo administrado
 * @param {boolean} bool O estado de combate do personagem
 */
async function setCombatState(target, personagemAtual, bool) {
  await db.set(`${target}.chars.${personagemAtual}.inCombat`, bool);
}

async function deleteDb(interaction, target) {
  await db.table('batalha').delete(`${interaction.channelId}.${target}`);
}

async function updateDb(interaction, batalha) {
  await db.table('batalha').set(`${interaction.channelId}`, batalha.db);
}

/**
 * Uma função que retorna um calculo de dano baseado no ataque do personagem e na defesa do oponente
 * @param {object} origem - O personagem que ataca
 * @param {object} alvo - O personagem que é atacado
 * @param {string} actionAlvo - Ação do personagem que é atacado
 * @param {number} dadoOrigem - Dado do personagem que ataca
 * @param {number} dadoAlvo - Dado do personagem que é atacado
 * @param esquivas - O número de esquivas que o personagem que é atacado possui
 * @returns Um calculo de dano ou um objeto com dados sobre a batalha.
 */
function calculo(
  origem = {},
  alvo = {},
  actionAlvo = '',
  dadoOrigem = 0,
  dadoAlvo = 0,
  esquivas = 1
) {
  const dano = Object.values(origem.armas)
    .filter(item => item.base)
    .map(item => itemComRng(origem, item, dadoOrigem))
    .reduce((a, b) => a + b, 0);
  const preparacao = Object.values(alvo.equipamentos)
    .filter(item => item.base)
    .map(item => itemComRng(alvo, item, dadoAlvo))
    .reduce((a, b) => a + b, 0);
  const defesa = preparacao ? preparacao : 0;
  const easterEggChance = Math.floor(Math.random() * 100) + 1;
  switch (actionAlvo) {
    case 'defender':
      if (dadoAlvo === 20)
        return {
          msg:
            easterEggChance >= 90
              ? 'Parry Inacreditável!\nhttps://youtu.be/C4gntXWPrw4\n⚠️ Você pode atacar o inimigo agora, sem fazer posts, pois reflexões assim não gastam tokens de combate.'
              : 'Parry perfeito! PRIIIM!\n⚠️ Você pode atacar o inimigo agora, sem fazer posts, pois reflexões assim não gastam tokens de combate.',
          payback: 'defesa_perfeita'
        };
      else {
        const handleEscudo = alvo.armas?.armaSecundaria?.tipo === 'escudo';

        if (handleEscudo) {
          const escudoBase = itemComRng(
            alvo,
            alvo.armas.armaSecundaria,
            dadoAlvo
          );
          return dano - escudoBase < 0 ? 0 : dano - escudoBase;
        } else
          return {
            danoTotal: dano,
            dano:
              Math.floor(
                dano -
                  dano * (0.15 + (0.3 * alvo.skills.resistencia) / 100) * 1.25 -
                  defesa
              ) < 0
                ? 0
                : Math.floor(
                    dano -
                      dano *
                        (0.15 + (0.3 * alvo.skills.resistencia) / 100) *
                        1.25 -
                      defesa
                  ),
            defesa:
              Math.floor(
                dano * (0.15 + (0.3 * alvo.skills.resistencia) / 100) * 1.25 -
                  defesa
              ) < 0
                ? 0
                : Math.floor(
                    dano *
                      (0.15 + (0.3 * alvo.skills.resistencia) / 100) *
                      1.25 -
                      defesa
                  ),
            custo: 15
          };
      }
    case 'esquiva':
      if (dadoAlvo === 20)
        return {
          msg:
            easterEggChance >= 90
              ? 'Esquiva Inacreditável!\nhttps://www.youtube.com/shorts/bLC4F51xLVQ'
              : 'Esquiva perfeita! VOOSH!',
          payback: 'esquiva_perfeita'
        };
      else
        return {
          danoTotal: dano,
          dano:
            Math.floor(
              dano -
                dano * (0.25 + (0.3 * alvo.skills.destreza) / 100) * 1.25 -
                defesa
            ) < 0
              ? 0
              : Math.floor(
                  dano -
                    dano * (0.25 + (0.3 * alvo.skills.destreza) / 100) * 1.25 -
                    defesa
                ),
          esquiva:
            Math.floor(
              dano * (0.25 + (0.3 * alvo.skills.destreza) / 100) * 1.25 - defesa
            ) < 0
              ? 0
              : Math.floor(
                  dano * (0.25 + (0.3 * alvo.skills.destreza) / 100) * 1.25 -
                    defesa
                ),
          custo: 5 * (esquivas ? esquivas : 1)
        };

    case 'contra_ataque':
      const danoAlvo = Object.values(alvo.armas)
        .filter(item => item.base)
        .map(item => itemComRng(alvo, item, dadoAlvo))
        .reduce((a, b) => a + b, 0);
      const defesaOrigem = Object.values(origem.equipamentos)
        .filter(item => item.base)
        .map(item => itemComRng(origem, item, dadoOrigem))
        .reduce((a, b) => a + b, 0);
      return {
        danoTotal: dano,
        dano: dano - defesa < 0 ? 0 : Math.floor(dano - defesa),
        danoAlvo:
          Math.floor(
            danoAlvo -
              danoAlvo *
                (0.15 + (0.3 * origem.skills.resistencia) / 100) *
                1.25 -
              defesaOrigem
          ) < 0
            ? 0
            : Math.floor(
                danoAlvo -
                  danoAlvo *
                    (0.15 + (0.3 * origem.skills.resistencia) / 100) *
                    1.25 -
                  defesaOrigem
              ),
        payback: 'contra_ataque'
      };
  }

  function itemComRng(player, item = {}, dado = 0) {
    const resultado =
      item.base +
      item.multiplicador.num * (player.skills[item.multiplicador.tipo] * 0.2);
    const multiplicadorBase = () => {
      if (dado === 20) return 3;
      else if (dado >= 14) return 1.25;
      else return 1;
    };
    return Math.floor(resultado * multiplicadorBase());
  }
}
