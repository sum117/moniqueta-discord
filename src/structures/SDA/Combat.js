import {ButtonInteraction, MessageActionRow, MessageButton} from 'discord.js';
import {bold, codeBlock, userMention} from '@discordjs/builders';
import {db} from '../../db.js';
import {PlayCardBase} from './PlayCardBase.js';

export class Combat extends PlayCardBase {
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  constructor() {
    super();
  }
  async init(interaction, target) {
    //Personagens
    this.origem = await this.character(interaction, interaction.user);
    this.alvo = await this.character(interaction, target);
    // Usuário bruto
    this.user = interaction.user;
    this.target = await interaction.guild.members.fetch(target);
    this.interaction = interaction;
    this.batalha1v1 = await (async () => {
      const batalha1v1 = await db.get(`${interaction.channelId}.${interaction.user.id}.batalha1v1`);
      if (!batalha1v1)
        await db.set(`${interaction.channelId}.${interaction.user.id}.batalha1v1`, {
          alvo: {
            saude: [this.alvo.skills.vitalidade * 10],
            mana: [this.alvo.skills.vigor * 5],
          },
          origem: {
            saude: [this.origem.skills.vitalidade * 10],
            mana: [this.origem.skills.vigor * 5],
          },
        });

      return await db.get(`${interaction.channelId}.${interaction.user.id}.batalha1v1`);
    })();
    return this;
  }
  async fisico() {
    const {alvo, batalha1v1, origem, interaction, target, user} = this;
    console.log(batalha1v1, origem, alvo);
    if (!interaction.customId.startsWith('ataque_fisico'))
      throw new Error('Você usou o método de ataque físico em uma interação incongruente.');
    console.log(interaction.customId.split('_')[3]);
    if (!(await db.get(`${interaction.guildId}.charMessages.${interaction.customId.split('_')[3]}`)))
      return interaction.reply('❌ A mensagem do alvo foi deletada, não é possível atacar.');
    const dadoOrigem = Math.floor(Math.random() * 20) + 1;
    const dadoAlvo = Math.floor(Math.random() * 20) + 1;

    const resposta = Math.floor(calculo(origem, alvo, undefined, undefined, dadoOrigem, dadoAlvo));

    if (typeof resposta === 'number')
      if (resposta < 1) {
        const painelFinal = interaction.reply({
          fetchReply: true,
          content: `${bold(origem.name)} derrubou ${bold(
            alvo.name,
          )}!\nO destino dele(a) deverá ser decidido nos proximos dez minutos, ou morrerá de sangramento de qualquer forma!`,
          components: [
            new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId(`executar_${target.id}`)
                .setStyle('DANGER')
                .setLabel('EXECUTAR!')
                .setEmoji('🗡️'),
              new MessageButton()
                .setCustomId(`poupar_${target.id}`)
                .setStyle('PRIMARY')
                .setLabel('POUPAR!')
                .setEmoji(''),
            ]),
          ],
        });
        const filtro = i => i.user.id === user.id;
        const coletor = (await painelFinal).createMessageComponentCollector({filtro, time: 60 * 10 * 1000, max: 1});

        coletor.on('collect', async button => {
          if (button.customId === 'executar_' + target.id) await handleExecutar(button);
          else {
            button.message.edit({content: `${bold(origem.name)} poupou ${bold(alvo.name)}...`, components: []});
            await button.channel.send({
              content: `A batalha entre ${bold(origem.name)} e ${bold(alvo.name)} acabou. O vencedor é ${bold(
                origem.name,
              )}, que decidiu poupar o(a) opositor(a)!`,
            });
            await db.delete(`${interaction.channelId}.${interaction.user.id}.batalha1v1`);
          }
        });
        coletor.on('end', collected => {
          if (!collected) return handleExecutar();
        });
        async function handleExecutar(btn) {
          await btn.message.edit({
            content: `${bold(origem.name)} executou ${bold(alvo.name)}... Que Sidera a tenha! 💀`,
            components: [],
          });
          const personagemAtual = await db.get(`${target.id}.chosenChar`);
          await db.set(`${target.id}.chars.${personagemAtual}.dead`, true);
          const updatedChar = await db.get(`${target.id}.chars.${personagemAtual}`);
          await btn.channel.send({
            content: `💀 ${bold(alvo.name)} morreu, ${userMention(
              target.id,
            )}!\n\nEm breve você poderá sair da carcaça somática e virar um fantasma. Porém, se você for um(a) ceifador(a), este personagem foi perdido para sempre!\n${codeBlock(
              JSON.stringify(updatedChar),
            )}`,
          });
          await db.delete(`${interaction.channelId}.${interaction.user.id}.batalha1v1`);
        }
      } else
        interaction.reply(
          resposta.msg ? resposta.msg : `${bold(origem.name)} infligiu ${bold(resposta)} de dano em ${bold(alvo.name)}`,
        );
    return db.set(
      `${interaction.channelId}.${interaction.user.id}.batalha1v1.alvo.saude`,
      batalha1v1.alvo.saude - resposta,
    );
  }
  // TODO: Fazer uma checagem da escolha da origem e do alvo. Se por acaso a origem utilizar um poder, usar o objeto dos poderes ao invés das armas. O mesmo para o alvo, só que adiciona ao invés de remover.
  async poder() {
    if (!interaction.customId === 'ataque_de_poder')
      throw new Error('Você usou o método de ataque poderoso em uma interação incongruente.');
  }
}

function calculo(origem = {}, alvo = {}, actionOrigem, actionAlvo = '', dadoOrigem = 0, dadoAlvo = 0) {
  const dano = Object.values(origem.armas)
    .filter(item => item.base)
    .map(item => itemComRng(origem, item, dadoOrigem))
    .reduce((a, b) => a + b, 0);

  const defesa = Object.values(alvo.equipamentos)
    .filter(item => item.base)
    .map(item => itemComRng(alvo, item, dadoAlvo))
    .reduce((a, b) => a + b, 0);

  const easterEggChance = Math.floor(Math.random() * 100) + 1;
  if (actionAlvo === 'bloqueio' && rng2 === 20)
    return {
      msg: easterEggChance >= 90 ? 'Parry Inacreditável!\nhttps://youtu.be/C4gntXWPrw4' : 'Parry perfeito! PRIIIM!',
      payback: 'refletir',
    };
  else if (actionAlvo === 'desvio' && rng2 === 20)
    return {
      msg:
        easterEggChance >= 90
          ? 'Esquiva Inacreditável!\nhttps://www.youtube.com/shorts/bLC4F51xLVQ'
          : 'Esquiva perfeita! VOOSH!',
      payback: 'desvio',
    };
  else return dano - defesa;

  function itemComRng(player, item = {}, dado = 0) {
    const resultado = item.base + item.multiplicador.num * (player.skills[item.multiplicador.tipo] * 0.2);
    const multiplicadorBase = () => {
      if (dado === 20) return 3;
      else if (dado >= 14) return 1.25;
      else return 1;
    };
    return resultado * multiplicadorBase();
  }
}
