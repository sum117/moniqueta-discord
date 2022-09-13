import {codeBlock, inlineCode, PermissionFlagsBits} from 'discord.js';
import fs from 'fs';
import yaml from 'yaml';

import {db} from '../../../db.js';
import {levels} from '../../../structures/SDA/levels.js';
import {delay} from '../../../util';

const path = './detached_zone/dbLog.yaml';

export const data = {
  event: 'messageCreate',
  kind: 'regular',
  name: 'log',
  description: 'Adquira o log puro de algum jogador do servidor.'
};

/** @param {Message} msg A mensagem que executou este comando
 * @param args Os argumentos passados para este comando
 */
export async function execute(msg, args) {
  // Argumentos raiz e erros.
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild))
    return msg.reply(
      '❌ Você não pode usar esse comando pois não é um administrador.'
    );
  const comando = args?.[0]
    ? args[0].match(/\d{17,20}/)
      ? args[0]
      : undefined
    : undefined;
  if (!comando)
    return msg.reply(
      `❌ Você não ofereceu uma marcação válida.\nUso correto: ${inlineCode(
        '$' + data.name + ' <menção>'
      )}`
    );
  const parsed = `${comando.replace(/[<>@!]/g, '')}`.trim();
  const dados = await db.get(`${parsed}`);
  if (!dados) return msg.reply('O usuário não tem um personagem.');

  const escolhido = dados?.chosenChar;
  const personagem = dados?.chars[escolhido];
  if (!escolhido || !personagem)
    return msg.reply('O usuário não tem um personagem.');

  // Código autorizado
  personagem.user = parsed;
  const log = await newLog(personagem);
  await delay(1);
  return msg.reply(codeBlock('yaml', log));
}

function getLog() {
  const file = fs.readFileSync(path, 'utf-8');
  return yaml.parse(file);
}

async function newLog({
  user,
  name,
  xpLog,
  level,
  xpCount,
  attributePoints: ap,
  skills
}) {
  const log = getLog() ?? {[user]: {}};
  const info = await getCorrectInfo(xpCount);
  const newObj = {
    PERSONAGEM: name,
    'XP CACHE': xpLog,
    'XP PARA NOVO NIVEL': levels[level],
    'XP TOTAL': xpCount,
    'XP CORRETO PARA O NIVEL': info.xpCorreta,
    LEVEL: level,
    'LEVEL CORRETO': info.lvlCorreto,
    'PONTOS DE ATRIBUTOS DISPONIVEIS': ap,
    'SKILLS DIFF - ESSE NUMERO DEVE SER ZERO':
      Object.values(skills).reduce((a, b) => a + b, 0) - 36 - level * 2
  };
  log[user] = newObj;
  const fileToSave = yaml.stringify(log);
  fs.writeFileSync(path, fileToSave);
  return yaml.stringify(newObj);
}

async function getCorrectInfo(xpCount) {
  return new Promise(resolve => {
    Object.values(levels).reduce((a, b, i) => {
      if (a > xpCount) {
        return resolve({
          lvlCorreto: i,
          xpCorreta: a - b
        });
      }
      return a + b;
    }, 0);
  });
}
