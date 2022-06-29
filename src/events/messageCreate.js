const { loadCommands } = require("../util.js");
const TextNovel = require('../structures/TextNovel.js')
let novel
module.exports = {
  name: "messageCreate",
  /**@param {Message} msg Qualquer mensagem recebida pelo bot.*/
  async execute(msg) {
    loadCommands(this.name, msg);
    if (msg.content.startsWith('init')) novel = new TextNovel(msg).novelFactory()
  },
};
