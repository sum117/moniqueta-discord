import {Client, Message} from 'discord.js';
import {categories} from '../../util';
import {PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {Xp} from '../../structures/SDA/Xp.js';
import { db } from '../../db.js';
export const data = {
  event: 'messageCreate',
  name: 'Enviar Playcard',
  description: 'Envia um playcard para o canal de playcards.'
};
/**
 *
 * @param {Client} client
 * @param {Message} msg
 */
export async function execute(client, msg) {
  const checkIfThread = (() => {
    if (msg.channel.isThread()) return msg.channel.parent.parentId;
    else return msg.channel.parentId
  })()

  if (!categories.rpCategories.includes(checkIfThread)) return;
  if (msg.author.bot) return;
  if (msg.content.match(/^(?:\/|\\|\(|\)|\[|\[|\])/))
    return setTimeout(
      () => msg.delete().catch(() => console.log('A mensagem não foi apagada pois não existe: playcardSend.js:26')),
      3 * 60 * 1000
    );
  const editCheck = await db.get(`${msg.author.id}.isEditting`) ?? false
  if (editCheck) return;

  if (msg.content.match(/^\!/) && msg.member.permissions.has('MANAGE_GUILD')) {
    const check = await handleWebhooks(msg);
    const webhook = check ? check : await msg.channel.createWebhook('moniquetaHook');
    await webhook.edit({
      name: msg.member.nickname ? msg.member.nickname : msg.author.username,
      avatar: msg.author.displayAvatarURL
        ? msg.author.displayAvatarURL({dynamic: true, size: 512})
        : msg.author.avatarURL({dynamic: true, size: 512})
    });
    await webhook.send({
      content: msg.content.slice(1),
      files: msg.attachments.size
        ? [
            {
              attachment: msg.attachments.first().attachment,
              name: msg.attachments.first().name
            }
          ]
        : undefined
    });
    return msg.delete().catch(() => console.log('A mensagem não foi apagada pois não existe: playcardSend.js:52'));
  }

  const char = new PlayCardBase();
  await char.interact(msg, 'send', msg.content, msg.attachments.first() ? msg.attachments.first() : undefined);
  const postCounter = client.postCounter.size ?? 0;
  client.postCounter.set(postCounter, Date.now());
  await msg.delete().catch(() => console.log('A mensagem não foi apagada pois não existe: playcardSend.js:59'));
  return await new Xp().passiveXp(msg, msg.content.length);
}

async function handleWebhooks(msg) {
  const webhooks = await msg.channel.fetchWebhooks();
  if (webhooks.size > 6) {
    webhooks.forEach(async wh => await wh.delete());
    return false;
  } else return webhooks.first();
}
