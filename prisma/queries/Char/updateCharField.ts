import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function updateCharField(charId: number, field: string, value: string) {
  return prisma.char.update({
    where: {
      id: charId
    },
    data: {
      [field]: value
    }
  });
}
