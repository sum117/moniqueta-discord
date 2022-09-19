import {CommandInteraction} from "discord.js";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function getLastMessageId(interaction: CommandInteraction) {
  return prisma.user.findUnique({
    where: {
      id: interaction.user.id,
    },
    select: {
      lastMessageId: true,
    },
  });
}
