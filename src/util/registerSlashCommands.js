import fs from "fs";
export async function registerSlashCommands(client, guildId) {
    const slashArray = fs
        .readdirSync("src/commands")
        .filter((file) => file.startsWith("slash."))
        .map(async (file) => {
            return (await import("./commands/" + file)).default.data.toJSON();
        });
    const slashCommands = await Promise.all(slashArray);
    await client.application.commands.set(slashCommands, guildId);
}
