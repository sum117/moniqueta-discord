import { moniqueta } from '../index.js';
import { myGuild } from '../util.js';

export default {
  event: 'inviteCreate',
  name: 'Invite Tracker',
  description:
    'Um comando automático do servidor que acompanha os convites dos usuários.',
  execute(invite) {
    console.log('Novo convite salvo.');
    moniqueta.inviteCodeUses.set(invite.code, invite.uses);
    moniqueta.guildInvites.set(myGuild, moniqueta.inviteCodeUses);
    console.log(moniqueta.guildInvites);
  },
};
