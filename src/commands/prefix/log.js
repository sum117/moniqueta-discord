import {codeBlock, inlineCode} from '@discordjs/builders';
import {Message} from 'discord.js';
import fs from 'fs';
import yaml from 'yaml';
import {db} from '../../db.js';
import {levels} from '../../structures/SDA/levels.js';
import {delay} from '../../util';
const path = './detached_zone/dbLog.yaml';

export const data = {
  event: 'messageCreate',
  kind: 'regular',
  name: 'log',
  description: 'Adquira o log puro de algum jogador do servidor.'
};

/** @param {Message} msg A mensagem que executou este comando*/
export async function execute(msg, args) {
  // Argumentos raiz e erros.
  if (!msg.member.permissions.has('MANAGE_GUILD'))
    return msg.reply('❌ Você não pode usar esse comando pois não é um administrador.');
  const comando = args?.[0] ? (args[0].match(/\d{17,20}/) ? args[0] : undefined) : undefined;
  if (!comando)
    return msg.reply(
      `❌ Você não ofereceu uma marcação válida.\nUso correto: ${inlineCode('$' + data.name + ' <menção>')}`
    );
  const parsed = `${comando.replace(/\<|\>|\@|\!/g, '')}`.trim();
  const dados = await db.get(`${parsed}`);
  if (!dados) return msg.reply(`O usuário não tem um personagem.`);

  const escolhido = dados?.chosenChar;
  const personagem = dados?.chars[escolhido];
  if (!escolhido || !personagem) return msg.reply(`O usuário não tem um personagem.`);

  // Código autorizado
  personagem.user = parsed;
  const log = newLog(personagem);
  const username = (await msg.guild.members.fetch({user: parsed})).user.username;
  delay(1);
  return msg.reply(codeBlock('yaml', log.replace(/\d{17,20}/g, `${username}`)));
}

function getLog() {
  const file = fs.readFileSync(path, 'utf-8');
  return yaml.parse(file);
}
function newLog({user, name, xpLog, level, xpCount}) {
  const log = getLog() ?? {[user]: {}};
  const info = getCorrectInfo(xpCount);
  const newObj = {
    PERSONAGEM: name,
    'XP CACHE': xpLog,
    'XP PARA NOVO NIVEL': levels[level],
    'XP TOTAL': xpCount,
    'XP CORRETO PARA O NIVEL': info.xpCorreta,
    LEVEL: level,
    'LEVEL CORRETO': info.lvlCorreto
  };
  log[user] = newObj;
  const fileToSave = yaml.stringify(log);
  fs.writeFileSync(path, fileToSave);
  return fileToSave;
}
function getCorrectInfo(xpCount) {
  return Object.values(levels).reduce((a, b, i) => {
    if (a > xpCount) {
      return {
        lvlCorreto: i,
        xpCorreta: a - b
      };
    }
    return a + b;
  }, 0);
}
