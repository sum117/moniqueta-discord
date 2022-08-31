import {loadCommands} from '.';

export async function loadEvents(moniqueta, events) {
  events.map(({name, once}) => {
    if (once)
      moniqueta.once(name, (...args) => loadCommands(name, moniqueta, ...args));
    else
      moniqueta.on(name, (...args) => loadCommands(name, moniqueta, ...args));
  });
}
