const Discord = require('discord.js')
module.exports = {
  event: 'messageCreate',
  name: 'Diga Olá',
  description: 'O bot dirá olá. Comando feito por razões de teste.',
  
  /**@param {Discord.Message} msg A mensagem que executou este comando*/
  execute(msg, args) {
    msg.reply('Olá!')
  }
}