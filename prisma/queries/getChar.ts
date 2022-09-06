import { CommandInteraction } from 'discord.js';
import type { Message } from 'discord.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getChar(arg: Message | CommandInteraction) {
  return prisma.char.findUnique({
    where: {
      chosenById:
        arg instanceof CommandInteraction ? arg.user.id : arg.author.id,
    },
    include: {
      equipment: true,
      skills: true,
      backpack: true,
      title: true,
      weapons: true,
    },
  });
}
