import {bold, userMention} from '@discordjs/builders';

import {channels, msToTime, myGuild} from '../../util';
export const data = {
  name: 'Invite Tracker',
  events: ['inviteCreate', 'guildMemberAdd', 'guildMemberRemove'],
  description: 'Um sistema para monitorar os convites dos membros do servidor.'
};

export async function execute(event, client, ...args) {
  const moniqueta = client;
  switch (event) {
    case 'inviteCreate':
      const [invite] = args;
      console.log('Novo convite salvo.');
      moniqueta.inviteCodeUses.set(invite.code, invite.uses);
      moniqueta.guildInvites.set(myGuild, moniqueta.inviteCodeUses);
      console.log(moniqueta.guildInvites);
      break;
    case 'guildMemberAdd':
      const [member] = args;
      const cachedInvites = moniqueta.guildInvites.get(member.guild.id);
      const newInvites = await member.guild.invites.fetch();

      const memberCount = member.guild.memberCount;
      try {
        const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code) < inv.uses);
        console.log('Cached', [...cachedInvites.keys()]);
        console.log(
          'New',
          [...newInvites.values()].map(inv => inv.code)
        );
        console.log('Used', usedInvite);

        member.guild.channels.cache
          .get(channels.loginoutChannel)
          .send(
            `🟩 O usuário ${userMention(member.user.id)} entrou através do código de convite \`${
              usedInvite.code
            }\`, gerado por ${userMention(usedInvite.inviterId)}. Agora somos ${bold(memberCount)}.`
          );
      } catch (err) {
        console.log(err);
      }

      newInvites.each(inv => cachedInvites.set(inv.code, inv.uses));
      moniqueta.guildInvites.set(member.guild.id, cachedInvites);
      break;
    case 'guildMemberRemove':
      const [memberThatLeft] = args;
      moniqueta.channels.cache
        .get(channels.loginoutChannel)
        .send(
          `🟥 O usuário ${memberThatLeft.user.username}, de ID ${memberThatLeft.id} com \`${msToTime(
            Date.now() - memberThatLeft.joinedTimestamp
          )}\` de servidor saiu.`
        );
      break;
  }
}
