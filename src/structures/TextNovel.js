const Discord = require('discord.js')
const { db } = require('../db.js')
module.exports = class TextNovel {
  /**@param {Discord.Message} message - Uma mensagem do Discord.*/
  constructor(message) {
    this.message = message
  }
  /**
   * @method
   * @name TextNovel#send
  * @param {String} input - A pergunta a ser respondida.
  */
  send(input = '') {
    if (this.message.author.bot) return

    return this.message.channel.send({
      content: input,
      components: [this.buttons]
    })
  }

  /**
   * @method 
   * @name TextNovel#setChoices
   * @param {Array<String>} choices - Uma matriz contendo as escolhas possíveis.
   */
  setChoices(choices = ['']) {
    this.choices = choices.constructor !== Array ? Array.from(arguments):choices
    return this
  }
  /**
   * @method
   * @name TextNovel#setRoute
   * @param {Boolean} boolean - Se a escolha do usuário cria uma nova rota.
   */
  setRoute(boolean = true || false) {
    this.route = boolean
    return this
  }
  /**
   * @method
   * @name TextNovel#novelFactory
   */
  async novelFactory() {
    let questions = []
    let answers = []
    const userId = this.message.author.id
    const creationStages = new Map()
    const messageCollector = new Promise((resolve) => { 
      creationStages.set('current', 'questions')
      this.message.channel.send(`❤️ Bem vindo(a) à fabrica de histórias interativas! Vamos começar com o básico. Primeiro, digite um enredo principal para gerar o primeiro capítulo da sua história.`)
      const filter = m => m.author.id === this.message.userId
      const collector = this.message.channel.createMessageCollector({filter, time:10 * 60 * 1000})  
      resolve(collector)
    })
    
    const novelId = async () => {
      const currentValue = await db.get('novel_counter')
      const entryChecker = Boolean(!(await db.list(`novel_${userId}_${novelId}`)))
      if (!entryChecker) await db.set('novel_counter', currentValue++)
      return await db.get('novel_counter')
    }
    const route = async () => {
      /**
       * @type {Array}
       * @constant routes Uma matriz contendo todas as rotas da novel.
       */
      const routes = await db.list(`novel_${userId}_${await novelId()}_`)
      if (!routes) await db.set(`novel_${userId}_${await novelId()}_root`, [questions, answers])

      
      db.set(`novel_${userId}_${await novelId()}_${nextRoute}`, [questions, answers])
      return 'Rota ' + nextRoute + ' criada com sucesso!'

    }
  }
  
  get buttons() {
    if (this.choices.length > 5) throw new Error('O Discord limita os botões para apenas 5 por matriz de ação.')

    const buttons = this.choices.map((possible, index) => {
      if (possible.length > 80) throw new Error('Botões podem ter apenas 80 caracteres.')
      return new Discord.MessageButton()
        .setCustomId('choice' + index)
        .setLabel(possible)
        .setStyle('SECONDARY')
    })
    const row = new Discord.MessageActionRow()
      .addComponents(buttons)

    return row
  }
}