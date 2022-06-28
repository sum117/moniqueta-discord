const {loadCommands} = require('../util.js')
const TextNovel = require('../structures/TextNovel.js')
module.exports = {
  name: 'messageCreate',
  /**@param {Message} msg Qualquer mensagem recebida pelo bot.*/
  async execute (msg) {
    loadCommands(this.name, msg)
    if (msg.content.startsWith('init')) novel = new TextNovel(msg).novelFactory()
  }
}