import { ButtonInteraction } from "discord.js";
import { Interaction } from "./Interaction.js";
import { bold } from "@discordjs/builders";
import { db } from "../../db.js";


class Combat extends Interaction {
    /**
    *
    * @param {ButtonInteraction} interaction
    */
    constructor(interaction) {
        super();

        this.origem = await this.character(interaction, interaction.user)
        this.alvo = await(async () => { const fetch = await this.target(interaction); return await this.character(interaction, fetch) })()

        this.batalha1v1 = (async () => {
            const batalha1v1 = await db.get(`${interaction.channelId}.${interaction.user.id}.batalha1v1`)
            if (!batalha1v1) await db.set(`${interaction.channelId}.${interaction.user.id}.batalha1v1`, {
                alvo: {
                    saude: [this.alvo.vitalidade * 10],
                    mana: [this.alvo.vigor * 5],
                },
                origem: {
                    saude: [this.origem.vitalidade * 10],
                    mana: [this.origem.vigor * 5]
                },
            })

            return await db.get(`${interaction.channelId}.${interaction.user.id}.batalha1v1`)
        })()
    }

    async fisico() {
        const batalha1v1 = await this.batalha1v1;
        if (!interaction.customId === 'ataque_fisico') throw new Error('Você usou o método de ataque físico em uma interação incongruente.');
        if (!await db.get(`${interaction.guildId}.charMessages.${interaction.message.id}`)) return interaction.reply('❌ A mensagem do alvo foi deletada, não é possível atacar.');
        const dadoOrigem = Math.floor(Math.random() * 20) + 1
        const dadoAlvo = Math.floor(Math.random() * 20) + 1

        const resposta = calculo(this.origem, this.alvo, interaction.customId, dadoOrigem, dadoAlvo)
        interaction.reply(resposta.msg ? resposta.msg : `${bold(this.origem.name)} infligiu ${bold(resposta)} de dano em ${bold(this.alvo.name)}`)

        if (typeof resposta === "number") return db.set(`${interaction.channelId}.${interaction.user.id}.batalha1v1.alvo.saude`, batalha1v1.alvo.saude - resposta);

    };
    // TODO: Fazer uma checagem da escolha da this.origem e do alvo. Se por acaso a this.origem utilizar um poder, usar o objeto dos poderes ao invés das armas. O mesmo para o alvo, só que adiciona ao invés de remover.
    async poder() {
        if (!interaction.customId === 'ataque_de_poder') throw new Error('Você usou o método de ataque poderoso em uma interação incongruente.');


    }
}

function calculo(origem = {}, alvo = {}, actionOrigem, actionAlvo = '', dadoOrigem = 0, dadoAlvo = 0) {
    const dano = Object.values(origem.armas)
        .filter(item => item.base)
        .map(item => itemComRng(origem, item, dadoOrigem))
        .reduce((a, b) => a + b, 0);

    const defesa = Object.values(alvo.equipamentos)
        .filter(item => item.base)
        .map((item) => itemComRng(alvo, item, dadoAlvo))
        .reduce((a, b) => a + b, 0);

    const easterEggChance = Math.floor(Math.random() * 100) + 1;
    if (actionAlvo === 'bloqueio' && rng2 === 20)
        return {
            msg: easterEggChance >= 90 ? 'Parry Inacreditável!\nhttps://youtu.be/C4gntXWPrw4' : 'Parry perfeito! PRIIIM!',
            payback: 'refletir'
        };
    else if (actionAlvo === 'desvio' && rng2 === 20)
        return {
            msg: easterEggChance >= 90 ? 'Esquiva Inacreditável!\nhttps://www.youtube.com/shorts/bLC4F51xLVQ' : 'Esquiva perfeita! VOOSH!',
            payback: 'desvio'
        };
    else
        return dano - defesa;

    function itemComRng(player, item = {}, dado = 0) {
        const resultado = (item.base + (item.multiplicador.num * (player.skills[item.multiplicador.tipo] * 0.2)));
        const multiplicadorBase = () => {
            if (dado === 20)
                return 3;
            else if (dado >= 14)
                return 1.25;
            else
                return 1;
        };
        return resultado * multiplicadorBase();
    }
}

