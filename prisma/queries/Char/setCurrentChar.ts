import {Char, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function setCurrentChar(charId: number, userId: string): Promise<Char | undefined> {
  // remove current char first
  await prisma.char.updateMany({
    where: {
      chosenById: userId
    },
    data: {
      chosenById: null
    }
  });

  const updated = await prisma.char.update({
    where: {
      id: charId
    },
    data: {
      chosenById: userId
    }
  });
  return updated;
}
