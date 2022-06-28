const Discord = require('discord.js')
const { db } = require('../db.js')
module.exports = class TextNovel {
  /**@param {Discord.Message} message - Uma mensagem do Discord.*/
  constructor(message) {
    this.message = message
    this.userId = message.author.id
    this.sessionCache = new Map()
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
    this.choices = choices.constructor !== Array ? Array.from(arguments) : choices
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
    const novelId = async () => {
      const currentValue = await db.get('novel_counter')
      const entryChecker = Boolean(!(await db.list(`novel_${this.userId}_${novelId}`)))
      if (!entryChecker) await db.set('novel_counter', currentValue++)
      return await db.get('novel_counter')
    }
    const route = async () => {
      /**
       * @type {Array}
       * @constant routes Uma matriz contendo todas as rotas da novel.
       */
      const routes = await db.list(`novel_${this.userId}_${await novelId()}_`)
      if (!routes) await db.set(`novel_${this.userId}_${await novelId()}_root`, [questions, answers])

      db.set(`novel_${this.userId}_${await novelId()}_${nextRoute}`, [questions, answers])
      return 'Rota ' + nextRoute + ' criada com sucesso!'
    }
    return this.msgCollector
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

  get msgCollector() {
    if (this.message.author.bot) return

    this.message.channel.send(`❤️ Bem vindo(a) à fabrica de histórias interativas! Vamos começar com o básico. Primeiro, digite um enredo principal para gerar o primeiro capítulo da sua história.`)

    console.log('Coletor criado com sucesso.')
    const filter = m => m.author.id === this.userId
    const collector = this.message.channel.createMessageCollector({ filter, time: 10 * 60 * 1000 })
    this.collector = collector
    
    return this.collector.on('collect', async m => {
      const stagesCache = this.sessionCache.get(m.author.id)
      
      if (!stagesCache.get('plot')) {
        this.reply = await m.reply(m.content)
        reactionMenu(this.reply, ['📌', '➕'])
      } else {
        this.setChoices(m.content.split(','))
        this.reply.edit({components: [this.buttons]})
      }
        /**{
        * @param {Discord.Message} reply - A mensagem base do editor de histórias
        * @param {Array<String>} reactions - As reações a serem adicionadas no menu de reações.
        */
        function reactionMenu(reply, reactions = ['']) {
          reactions.forEach((one, i) => setTimeout(() => reply.react(one), i * 1000))
          const filter = r => r.users.holds(reply.author.id) && r.message.id === reply.id
          const reactionCollector = reply.createReactionCollector({ filter, time: 10 * 60 * 1000, max: 1 })

          return this.reactionCollector = reactionCollector.on('collect', r => {
            if (r.emoji === '📌') {
              r.remove()
              r.message.edit(output)

              const currentContent = new Map()
              currentContent.set('plot', reply.content)
              this.sessionCache(reply.author.id, currentContent)
              this.collector.resetTimer()
              reply.reactions.removeAll()
              reactionCollector.stop()
            }
          })
        }
      })
  }
}