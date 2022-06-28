const {loadCommands} = require('../util.js')
module.exports = {
  name: 'messageCreate',
  /**@param {Message} msg Qualquer mensagem recebida pelo bot.*/
  async execute (msg) {
    loadCommands(this.name, msg)
  }
}