import { myGuild } from '../util.js';
export default {
  event: 'ready',
  name: 'Invite Tracker',
  description:
    'Um comando automático do servidor que acompanha os convites dos usuários.',
  execute(moniqueta) {
    moniqueta.guilds.fetch(myGuild).then((guild) =>
      guild.invites.fetch().then((invites) => {
        console.log('Novos convites foram salvos.');
        invites.each((invite) =>
          moniqueta.inviteCodeUses.set(invite.code, invite.uses),
        );
        moniqueta.guildInvites.set(myGuild, moniqueta.inviteCodeUses);
        console.log(moniqueta.guildInvites);
      }),
    );
  },
};
