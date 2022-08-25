import {db} from '../db.js';
import {channels} from './misc.js';
export function updateMemberCounter(moniqueta, myGuild) {
  setInterval(async () => {
    const memberCounter = moniqueta.guilds.cache.get(myGuild).channels.cache.get(channels.memberCounter);
    const postCounter = moniqueta.guilds.cache.get(myGuild).channels.cache.get(channels.postCounter);
    const charCounter = moniqueta.guilds.cache.get(myGuild).channels.cache.get(channels.charCounter);
    const totalChars = await (async () => {
      let database = await db.all();
      let total = database
        .filter(({_id, value}) => value?.chars !== undefined)
        .map(({_id, value}) => {
          let values = Object.values(value.chars);
          return values
            .filter(value => {
              return value?.xpCount > 0;
            })
            .map(value => value.xpCount);
        })
        .flat()
        .reduce((a, b) => a + b, 0);
      return total;
    })();

    moniqueta.postCounter.forEach((time, index) => {
      if (Date.now() - time > 8 * 3600 * 1000) moniqueta.postCounter = moniqueta.postCounter.splice(index, 1);
    });
    moniqueta.memberCounter.forEach((time, user) => {
      if (Date.now() - time > 8 * 3600 * 1000) moniqueta.memberCounter.delete(user);
    });
    memberCounter.edit({
      name: memberCounter.name.replace(/\d+/, moniqueta.memberCounter.size)
    });
    postCounter.edit({
      name: postCounter.name.replace(/\d+/, moniqueta.postCounter.length)
    });
    charCounter.edit({
      name: charCounter.name.replace(/\d+/, totalChars)
    });
  }, 5 * 60 * 1000);
}
