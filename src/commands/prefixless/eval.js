import {db} from '../../db.js';
import fs from 'fs';
import path from 'path';

function walk(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        return reject(error);
      }
      Promise.all(
        files.map(file => {
          return new Promise((resolve, reject) => {
            const filepath = path.join(dir, file);
            fs.stat(filepath, (error, stats) => {
              if (error) {
                return reject(error);
              }
              if (stats.isDirectory()) {
                walk(filepath).then(resolve);
              } else if (stats.isFile()) {
                resolve(filepath);
              }
            });
          });
        })
      ).then(foldersContents => {
        resolve(foldersContents.reduce((all, folderContents) => all.concat(folderContents), []));
      });
    });
  });
}
const msgTop = db.table('msgTop');
export const data = {
  event: 'messageCreate',
  name: 'Validar JavaScript',
  description: 'Valida javascript desde que seja executada pelo dono da aplicação.'
};
export async function execute(client, msg) {
  const evalChId = '1007568778328035408';
  const botOwnerId = '969062359442280548';
  if (msg.channelId != evalChId) return;
  if (msg.author.id != botOwnerId) return;

  const evaluate = async str => `${eval(str)}`;
  let content = msg.content;

  if (content == 'ls') {
    let tree = await walk('src');
    tree = tree.join('\n');
    return msg.reply(tree);
  } else if (!content.match(/msg/g))
    return msg.reply(
      'O comando eval utiliza o objeto da mensagem como operador e é limitado à importação dinâmica ou à constante estatica do DB.'
    );
  return evaluate(content);
}
