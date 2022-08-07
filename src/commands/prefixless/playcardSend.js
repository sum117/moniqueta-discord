import {Client, Message} from 'discord.js';
import {categories} from '../../util';
import {PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {Xp} from '../../structures/SDA/Xp.js';
import {moniqueta} from '../..';
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
  if (!categories.rpCategories.includes(msg.channel.parentId)) return;
  if (msg.author.bot) return;
  if (msg.content.match(/^(?:\/|\\|\(|\)|\[|\[|\])/))
    return setTimeout(
      () => msg.delete().catch(() => console.log('A mensagem não foi apagada pois não existe: playcardSend.js:21')),
      3 * 60 * 1000
    );

  if (msg.content.match(/^\!/) && msg.member.permissions.has('MANAGE_GUILD')) {
    const check = await handleWebhooks(msg);
    const webhook = check ? check : await msg.channel.createWebhook('moniquetaHook');
    await webhook.edit({
      name: msg.member.nickname ? msg.member.nickname : msg.author.username,
      avatar: msg.author.displayAvatarURL
        ? msg.author.displayAvatarURL({dynamic: true, size: 512})
        : msg.author.avatarURL({dynamic: true, size: 512})
    });
    webhook.send({
      content: msg.content.slice(1),
      files: msg.attachments
        ? [
            {
              attachment: msg.attachments.first().attachment,
              name: msg.attachments.first().name
            }
          ]
        : undefined
    });
    return msg.delete().catch(() => console.log('A mensagem não foi apagada pois não existe: playcardSend.js:45'));
  }

  const char = new PlayCardBase();
  await char.interact(msg, 'send', msg.content, msg.attachments.first() ? msg.attachments.first() : undefined);
  const postCounter = client.postCounter.size ?? 0;
  client.postCounter.set(postCounter, Date.now());
  await msg.delete().catch(() => console.log('A mensagem não foi apagada pois não existe: playcardSend.js:53'));
  return await new Xp().passiveXp(msg, msg.content.length);
}

async function handleWebhooks(msg) {
  const webhooks = await msg.channel.fetchWebhooks();
  if (webhooks.size > 6) {
    webhooks.forEach(async wh => await wh.delete());
    return false;
  } else return webhooks.first();
}
