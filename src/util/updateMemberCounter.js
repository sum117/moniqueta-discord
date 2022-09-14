import {db} from '../db.js';
import {channels} from './misc.js';

export function updateMemberCounter(moniqueta, myGuild) {
  setInterval(async () => {
    let memberCounter = moniqueta.guilds.cache
      .get(myGuild)
      .channels.cache.get(channels.memberCounter);
        let charCounter = moniqueta.guilds.cache
      .get(myGuild)
      .channels.cache.get(channels.charCounter);
    let totalChars = await (async () => {
      let database = await db.all();
      return database
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
    })();

        moniqueta.memberCounter.forEach((time, user) => {
      if (Date.now() - time > 8 * 3600 * 1000)
        moniqueta.memberCounter.delete(user);
    });
    memberCounter.edit({
      name: memberCounter.name.replace(/\d+/, moniqueta.memberCounter.size)
    });
        charCounter.edit({
      name: charCounter.name.replace(/\d+/, totalChars)
    });
  }, 10 * 60 * 1000);
}
