import {PrismaClient} from '@prisma/client';
import {ButtonInteraction, CommandInteraction, Message, ModalSubmitInteraction} from 'discord.js';

const prisma = new PrismaClient();

export async function getCurrentChar(
  arg: Message | CommandInteraction | ButtonInteraction | ModalSubmitInteraction
) {
  return prisma.char.findUnique({
    where: {
      chosenById:
        arg instanceof CommandInteraction ||
        arg instanceof ButtonInteraction ||
        arg instanceof ModalSubmitInteraction
          ? arg.user.id
          : arg.author.id
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
