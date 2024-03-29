import {bold, quote} from '@discordjs/builders';

import {db} from '../../db.js';
import {PlayCardBase} from '../../structures/SDA/PlayCardBase.js';
import {Xp} from '../../structures/SDA/Xp.js';
import {categories} from '../../util';

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
  if (msg.type === 'ChannelPinnedMessage') return;
  if (msg.content.startsWith(client.prefix)) return;
  const checkIfThread = (() => {
    if (msg.channel.isThread()) return msg.channel.parent.parentId;
    else return msg.channel.parentId;
  })();

  if (!categories.rpCategories.includes(checkIfThread)) return;
  if (msg.author.bot) return;
  if (msg.content.match(/^[\/\\()\[\]]/))
    return setTimeout(
      () =>
        msg
          .delete()
          .catch(() =>
            console.log(
              'A mensagem não foi apagada pois não existe: playcardSend.js:26'
            )
          ),
      3 * 60 * 1000
    );
  const editCheck = (await db.get(`${msg.author.id}.isEditting`)) ?? false;
  if (editCheck) return;

  if (msg.content.match(/^!/) && msg.member.permissions.has('MANAGE_GUILD')) {
    const check = await handleWebhooks(msg);
    if (msg.channel.isThread())
      return msg.reply(
        'É esperado que você saiba que o bot é incapaz de criar uma thread dentro de uma thread. Comandos que usam threads como filhos não funcionam dentro de um ambiente thread.'
      );
    const webhook = check
      ? check
      : await msg.channel.createWebhook({name: 'moniquetaHook'});
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
    return msg
      .delete()
      .catch(() =>
        console.log(
          'A mensagem não foi apagada pois não existe: playcardSend.js:52'
        )
      );
  }

  const char = new PlayCardBase();

  try {
    const sent = await char.interact(
      msg,
      'send',
      msg.content,
      msg.attachments.first() ? msg.attachments.first() : undefined
    );

    await msg
      .delete()
      .catch(() =>
        console.log(
          'A mensagem não foi apagada pois não existe: playcardSend.js:70'
        )
      );
    const {
      name,
      xpCount: xp,
      attributePoints: ap,
      xpLog: cache,
      level
    } = await char.character(msg, msg.author);
    sent.content = `Mensagem enviada por ${msg.author.username} em ${msg.channel}.`;
    await msg.guild.channels.cache
      .get('977090634466857030')
      .send({content: sent.content, embeds: [sent.embeds?.[0]]});
    await msg.guild.channels.cache
      .get('977098576075321374')
      .send(
        `${bold(name)} de ${msg.author.username} enviou um post com ${bold(
          msg.content.length
        )} caracteres em ${msg.channel}\n${quote(
          'Pontos de Atributos: ' + ap
        )}\n${quote('Cache de XP: ' + cache)}\n${quote(
          'Level do Personagem: ' + level
        )}\n${quote('XP Total: ' + xp)}\n${quote(
          'TEMPO DE ENVIO EXATO: ' + `<t:${Math.floor(Date.now() / 1000)}:D>`
        )}`
      )
      .catch(
        () =>
          new Error(
            'Houve um erro ao salvar a mensagem de algum personagem: playcardSend.js:83'
          )
      );
    return await new Xp().passiveXp(msg, msg.content.length);
  } catch (error) {
    return msg.reply(
      'Você encontrou um erro. O seu personagem provavelmente não existe, ou o sistema não se comunicou com o Discord a tempo. Contate um administrador para ajudar no bot!'
    );
  }
}

async function handleWebhooks(msg) {
  const webhooks = await msg.channel.fetchWebhooks();
  if (webhooks.size > 6) {
    webhooks.map(async wh => await wh.delete());
    return false;
  } else return webhooks.first();
}
