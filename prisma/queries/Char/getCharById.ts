import {PrismaClient} from '@prisma/client';
import {Snowflake} from 'discord.js';

const prisma = new PrismaClient();

export async function getCharById(charId: number, authorId: Snowflake) {
  return prisma.char.findMany({
    where: {
      id: charId,
      authorId: authorId
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
