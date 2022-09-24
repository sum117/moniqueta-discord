import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteChar(charId: number) {
  return prisma.char.delete({
    where: {
      id: charId,
    },
  });
}
