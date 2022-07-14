import { moniqueta } from '../index.js';
import { channels } from '../util.js';
import { userMention, bold } from '@discordjs/builders';
export default {
  event: 'guildMemberAdd',
  name: 'Invite Tracker',
  description:
    'Um comando automático do servidor que acompanha os convites dos usuários.',
  async execute(member) {
    const cachedInvites = moniqueta.guildInvites.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();

    const memberCount = member.guild.memberCount;
    try {
      const usedInvite = newInvites.find(
        (inv) => cachedInvites.get(inv.code) < inv.uses,
      );
      console.log('Cached', [...cachedInvites.keys()]);
      console.log(
        'New',
        [...newInvites.values()].map((inv) => inv.code),
      );
      console.log('Used', usedInvite);

      member.guild.channels.cache
        .get(channels.loginoutChannel)
        .send(
          `🟩 O usuário ${userMention(
            member.user.id,
          )} entrou através do código de convite \`${
            usedInvite.code
          }\`, gerado por ${userMention(
            usedInvite.inviterId,
          )}. Agora somos ${bold(memberCount)}.`,
        );
    } catch (err) {
      console.log(err);
    }

    newInvites.each((inv) => cachedInvites.set(inv.code, inv.uses));
    moniqueta.guildInvites.set(member.guild.id, cachedInvites);
  },
};
