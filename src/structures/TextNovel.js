const Discord = require("discord.js");
const { db } = require("../db.js");
module.exports = class TextNovel {
  /**@param {Discord.Message} message - Uma mensagem do Discord.*/
  constructor(message) {
    this.message = message;
    this.userId = message.author.id;
    this.sessionCache = new Map();
  }
  /**
   * @method
   * @name TextNovel#send
   * @param {String} input - A pergunta a ser respondida.
   */
  send(input = "") {
    if (this.message.author.bot) return;

    return this.message.channel.send({
      content: input,
      components: [this.buttons],
    });
  }

  /**
   * @method
   * @name TextNovel#setChoices
   * @param {Array<String>} choices - Uma matriz contendo as escolhas possíveis.
   */
  setChoices(choices = [""]) {
    this.choices =
      choices.constructor !== Array ? Array.from(arguments) : choices;
    return this;
  }
  /**
   * @method
   * @name TextNovel#setRoute
   * @param {Boolean} boolean - Se a escolha do usuário cria uma nova rota.
   */
  setRoute(boolean = true || false) {
    this.route = boolean;
    return this;
  }
  /**
   * @method
   * @name TextNovel#novelFactory
   */
  async novelFactory() {
    const novelId = async () => {
      const currentValue = await db.get("novel_counter");
      const novel = await db.list(`novel_${this.userId}_${novelId}`);
      const entryChecker = Boolean(novel);
      if (!entryChecker) await db.set("novel_counter", currentValue++);
      return await db.get("novel_counter");
    };

    const route = async ([]) => {
      const id = await novelId();
      /**
       * @type {Array}
       * @constant routes Uma matriz contendo todas as rotas da novel.
       */
      const routes = await db.list(`novel_${this.userId}_${id}_`);
      if (!routes)
        await db.set(`novel_${this.userId}_${id}_root` /* Add stuff here */);

      db.set(`novel_${this.userId}_${id}_${nextRoute}` /* Add stuff here */);
      return "Rota " + nextRoute + " criada com sucesso!";
    };

    if (!this.results) return this.novelCollector;
    else route();
  }

  get buttons() {
    if (this.choices.length > 5)
      throw new Error(
        "O Discord limita os botões para apenas 5 por matriz de ação."
      );

    const buttons = this.choices.map((possible, index) => {
      if (possible.length > 80)
        throw new Error("Botões podem ter apenas 80 caracteres.");
      return new Discord.MessageButton()
        .setCustomId("choice" + index)
        .setLabel(possible)
        .setStyle("SECONDARY");
    });
    const row = new Discord.MessageActionRow().addComponents(buttons);

    return row;
  }

  get novelCollector() {
    if (this.message.author.bot) return;

    this.message.channel.send(
      `❤️ Bem vindo(a) à fabrica de histórias interativas! Vamos começar com o básico. Primeiro, digite um enredo principal para gerar o primeiro capítulo da sua história.`
    );

    console.log("Coletor criado com sucesso.");
    const filter = (m) => m.author.id === this.userId;
    const collector = this.message.channel.createMessageCollector({
      filter,
      time: 10 * 60 * 1000,
    });
    this.collector = collector;

    return this.collector.on("collect", async (m) => {
      const stagesCache = this.sessionCache.get(m.author.id);
      console.log(stagesCache)
      if (!stagesCache?.get("plot")) {
        if (!this.reply) this.reply = await m.reply(m.content);
        else this.reply.edit(m.content);
        this.reactions = ["📌", "➕"]
        this.emojiCollector;
      } else {
        this.setChoices(m.content.split(","));
        this.reply.edit({ components: [this.buttons] });
        this.reactions = ["✅"]
        this.emojiCollector;
      }
    });
  }
  get emojiCollector() {
    const reply = this.reply
    const reactions = this.reactions
    reactions.forEach((one, i) =>
      setTimeout(() => reply.react(one), i * 1000)
    );
    const filter = (r, u) =>
       u.id === this.userId && r.message.id === reply.id;
    const reactionCollector = reply.createReactionCollector({
      filter,
      time: 10 * 60 * 1000,
      max: 1
    });
    this.reactionCollector = reactionCollector;
    
    return this.reactionCollector.on("collect", (r) => {
      if (r.emoji.name === "📌") {
        r.message.edit({content: 'Muito bem, agora digite as alternativas possíveis para o usuário. \n\n ⚠️ Devido às limitações do Discord, é impossível ultrapassar 80 caracteres por opção.'});

        const currentContent = this.contentStream
          ? new Map("plot", this.contentStream)
          : new Map().set("plot", reply.content);
        this.sessionCache.set(this.userId, currentContent);
        this.collector.resetTimer();
        reply.reactions.removeAll();
        reactionCollector.stop();
      } else if (r.emoji === "➕") {
        if (!this.contentStream) {
          this.contentStream = [];
          this.contentStream.push(reply.content);
        } else this.contentStream.push(reply.content);

        this.reactionCollector.resetTimer();
      } else if (r.emoji === "✅") {
        r.remove();
        r.message.edit(`❤️ Criação de capítulo finalizada!`);
        this.sessionCache.set(this.userId, [["actions",r.message.components]]);
        const returnArray = [
          this.sessionCache.get("plot"),
          this.sessionCache.get("actions"),
        ];
        reply.reactions.removeAll();
        reactionCollector.stop();
        return this.results = returnArray;
      }
    });
  }
};
