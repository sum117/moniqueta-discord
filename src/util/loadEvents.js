import {loadCommands} from '.';

export async function loadEvents([moniqueta, musicPlayer], events, musicPlayerEvents) {
  events.map(({name, once}) => {
    if (once) moniqueta.once(name, (...args) => loadCommands(name, [moniqueta, musicPlayer], ...args));
    else moniqueta.on(name, (...args) => loadCommands(name, [moniqueta, musicPlayer], ...args));
  });
  musicPlayerEvents.forEach((action, eventName) => {
    musicPlayer.on(eventName, (...args) => action(...args));
  });
}
