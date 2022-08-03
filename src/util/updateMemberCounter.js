import {channels} from './misc.js';
export function updateMemberCounter(moniqueta, myGuild) {
  setInterval(() => {
    const memberCounter = moniqueta.guilds.cache.get(myGuild).channels.cache.get(channels.memberCounter);
    moniqueta.memberCounter.forEach((time, user) => {
      if (Date.now() - time > 8 * 3600 * 1000) moniqueta.memberCounter.delete(user);
    });
    memberCounter.edit({
      name: memberCounter.name.replace(/\d+/, moniqueta.memberCounter.size)
    });
  }, 5 * 60 * 1000);
}
