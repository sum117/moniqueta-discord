import sharp from 'sharp';
import axios from 'axios';

export const data = {
  event: 'messageCreate',
  type: 'regular',
  name: 'Imagem para Icone',
  description: 'Transforma uma imagem em um icone com uma borda de cor especificada pelo usuário.',
};
/**
 * @param {Message} msg A mensagem que iniciou o comando.
 * @param {String} args Os argumentos enviados pelo bot para a execução do comando.
 */
export async function execute(msg, args) {
  /**
   * @type {String}
   * @constant imageUrl Um link de imagem com extensão no final.
   * @constant color A cor da borda.
   */

  const [color, imageUrl] = args;
  if (!color) return msg.reply('❌ Você precisa informar uma cor para o icone.');
  const userInput = await (await axios({url: imageUrl, responseType: 'arraybuffer'})).data;
  if (!imageUrl) return msg.reply('❌ Você precisa informar um link de imagem.');

  const radius = Buffer.from(
    `<svg
                width="512"
                height="512"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="256"
                    cy="256"
                    r="256"
                    fill="white"
                />
            </svg>`,
  );
  const border = Buffer.from(
    `<svg
                width="512"
                height="512"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="256"
                    cy="256"
                    r="251"
                    stroke="${color.includes('#') ? color : '#' + color}"
                    stroke-width="15"
                />
            </svg>
            `,
  );
  const output = await sharp(userInput)
    .resize(512, 512)
    .composite([
      {
        input: radius,
        blend: 'dest-in',
      },
      {
        input: border,
        blend: 'atop',
      },
    ])
    .png()
    .toBuffer();

  msg.reply({
    content: 'Icone gerado com sucesso!',
    files: [{name: 'icon.png', attachment: output}],
  });
}
