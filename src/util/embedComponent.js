import {EmbedBuilder} from 'discord.js';
import {moniqueta} from '../index.js';

export async function embedComponent(description = '', fields = [{name: '', value: ''}] ?? undefined) {
  return new EmbedBuilder()
    .setColor('RANDOM')
    .setTimestamp(Date.now())
    .setFooter({
      iconURL: moniqueta.user.avatarURL({dynamic: true, size: 512}),
      text: '© 2022 Moniqueta'
    })
    .setDescription(description);
}
