import {levels} from '../../structures/SDA/levels.js';
import fs from 'fs';
import yaml from 'yaml';
import {db} from '../../db.js';
import {codeBlock, inlineCode} from '@discordjs/builders';
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
  const comando = args?.[0] ? (args?.[0].match(/\d{17,20}/) ? args?.[0] : undefined) : undefined;
  if (!comando)
    return msg.reply(
      `Você não ofereceu uma marcação válida.\nUso correto: ${inlineCode('$' + data.name + '<menção>')}`
    );
  const dados = await db.get(`${comando}`);
  if (!dados) return msg.reply(`O usuário não tem um personagem.`);

  const escolhido = dados?.chosenChar;
  const personagem = dados?.chars[escolhido];
  if (!escolhido || !personagem) return msg.reply(`O usuário não tem um personagem.`);

  // Código autorizado
  personagem.user = `${comando.replace(/(\<|\>|\@|\!)/, '')}`;
  newLog(personagem);
  delay(1);
  return msg.reply(codeBlock('yaml', getLog()));
}

function getLog() {
  const file = fs.readFileSync(path, 'utf-8');
  return yaml.parse(file);
}
function newLog({user, name, xpLog, level, xpCount}) {
  const log = getLog();

  log[user] = {
    PERSONAGEM: name,
    'XP CACHE': xpLog,
    'XP PARA NOVO NIVEL': levels[level],
    'XP TOTAL': xpCount,
    'XP CORRETO PARA O NIVEL': getCorrectInfo(xpCount).xpCorreta,
    LEVEL: level,
    'LEVEL CORRETO': getCorrectInfo(xpCount).xpCorreta
  };
  const fileToSave = yaml.stringify(log);
  fs.writeFileSync(path, fileToSave);
}
function getCorrectInfo(xpCount) {
  new Promise(resolve => {
    Object.values(levels).reduce((a, b, i) => {
      if (a > +xpCount) {
        return resolve({
          lvlCorreto: i,
          xpCorreta: a - b
        });
      }
      return a + b;
    }, 0);
  });
}
