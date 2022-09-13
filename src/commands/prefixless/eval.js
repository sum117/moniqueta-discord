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
        resolve(
          foldersContents.reduce(
            (all, folderContents) => all.concat(folderContents),
            []
          )
        );
      });
    });
  });
}

export const data = {
  event: 'messageCreate',
  name: 'Validar JavaScript',
  description:
    'Valida javascript desde que seja executada pelo dono da aplicação.'
};

export async function execute(_client, msg) {
  const evalChId = '1007568778328035408';
  const botOwnerId = '969062359442280548';
  if (msg.channelId !== evalChId) return;
  if (msg.author.id !== botOwnerId) return;

  const evaluate = async str => `${eval(str)}`;
  let content = msg.content.replace(/```js|```/g, '');

  if (content === 'ls') {
    let tree = await walk('src');
    const depthCount = str => str.match(/\//gm).length;
    tree = tree
      .map(depth => {
        let dp = depthCount(depth);
        return `${'—'.repeat(dp)} ${depth}`;
      })
      .sort((depthA = '', depthB = '') => {
        depthA = depthCount(depthA);
        depthB = depthCount(depthB);
        return depthA - depthB;
      })
      .join('\n');
    return tree.length > 2000
      ? tree
          .split(/(?<=^(?:.{2000})+)(?!$)/gs)
          .sort((a, b) => b - a)
          .forEach(t => msg.channel.send(t))
      : msg.channel.send(tree);
  } else if (!content.match(/msg/g) && msg.type !== 'CHANNEL_PINNED_MESSAGE')
    return msg.reply(
      'O comando eval utiliza o objeto da mensagem como operador e é limitado à importação dinâmica ou à constante estatica do DB.'
    );
  return evaluate(content);
}
