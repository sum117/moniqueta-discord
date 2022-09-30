import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function setCurrentChar(charId: number, userId: string) {
  // remove current char first
  await prisma.char.updateMany({
    where: {
      chosenById: userId,
    },
    data: {
      chosenById: null,
    }
  });
  return prisma.char.update({
    where: {
      id: charId
    },
    data: {
        chosenById: userId
    }
  });
}