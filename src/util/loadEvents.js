import { loadCommands } from ".";

export async function loadEvents(moniqueta, events = [{ name: "", once: false }]) {
    events.map(({ name, once }) => {
        if (once)
            client.once(name, (...args) => loadCommands(name, moniqueta, ...args));
        else
            client.on(name, (...args) => loadCommands(name, moniqueta, ...args));
    });
}
