const Discord = require('discord.js')
const { db } = require('../db.js')
module.exports = class TextNovel {
  /**@param {Discord.Message} message - Uma mensagem do Discord.*/
  constructor(message) {
    this.message = message

  }
  /**
  * @param {String} input - A pergunta a ser respondida.
  */
  send(input = '') {
    if (this.message.author.bot) return

    return this.message.channel.send({
      content: input,
      components: [this.buttons]
    })
  }

  /** @param {Array<String>} choices - Uma matriz contendo as escolhas possíveis.*/
  setChoices(choices = ['']) {
    this.choices = Array.from(arguments)
    return this
  }


  get buttons() {
    if (this.choices.length > 5) return new Error('O Discord limita os botões para apenas 5 por matriz de ação.')

    const buttons = this.choices.map((possible, index) => {
      if (possible.length > 80) return new Error('Botões podem ter apenas 80 caracteres.')
      return new Discord.MessageButton()
        .setCustomId('choice' + index)
        .setLabel(possible)
        .setStyle('SECONDARY')
    })
    const row = new Discord.MessageActionRow()
      .addComponents(buttons)

    return row
  }

  async novelFactory() {
    let questions = []
    let answers = []
    const userId = this.message.author.id

    const novelId = async () => {
      const currentValue = await db.get('novel_counter')
      const entryChecker = Boolean(!(await db.list(`novel_${userId}_${novelId}`)))
      if (!entryChecker) await db.set('novel_counter', currentValue++)
      return await db.get('novel_counter')
    }
    const route = async () => {
      const routes = await db.list(`novel_${userId}_${await novelId()}_`)
      if (!routes) await db.set(`novel_${userId}_${await novelId()}_${route}`, [1, questions, answers])
      const nextRoute = routes


    }

  }
}