import { moniqueta } from "../index.js";
import { channels, msToTime } from "../util.js";
export default {
  event: "guildMemberRemove",
  name: "Invite Tracker",
  description:
    "Um comando automático do servidor que acompanha os convites dos usuários.",
  execute(member) {
    moniqueta.channels.cache
      .get(channels.loginoutChannel)
      .send(
        `🟥 O usuário ${member.user.username}, de ID ${
          member.id
        } com \`${msToTime(
          Date.now() - member.joinedTimestamp
        )}\` de servidor saiu.`
      );
  },
};
