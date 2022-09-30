import {PrismaClient} from '@prisma/client';
import {ButtonInteraction,CommandInteraction, Message} from 'discord.js';

const prisma = new PrismaClient();

export async function getCurrentChar(arg: Message | CommandInteraction | ButtonInteraction) {
  return prisma.char.findUnique({
    where: {
      chosenById: arg instanceof CommandInteraction || arg instanceof ButtonInteraction ?
        arg.user.id : arg.author.id
    },
    include: {
      equipment: true,
      skills: true,
      backpack: true,
      title: true,
      weapons: true
    }
  });
}
