import {channels} from './misc.js';
export function updateMemberCounter(moniqueta, myGuild) {
  setInterval(() => {
    const memberCounter = moniqueta.guilds.cache.get(myGuild).channels.cache.get(channels.memberCounter);
    const postCounter = moniqueta.guilds.cache.get(myGuild).channels.cache.get(channels.postCounter);
    moniqueta.postCounter.forEach((time, post) => {
      if (Date.now() - time > 8 * 3600 * 1000) moniqueta.postCounter.delete(post);
    });
    moniqueta.memberCounter.forEach((time, user) => {
      if (Date.now() - time > 8 * 3600 * 1000) moniqueta.memberCounter.delete(user);
    });
    memberCounter.edit({
      name: memberCounter.name.replace(/\d+/, moniqueta.memberCounter.size)
    });
    postCounter.edit({
      name: postCounter.name.replace(/\d+/, moniqueta.postCounter.size)
    });
  }, 5 * 60 * 1000);
}
