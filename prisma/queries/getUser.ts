import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function getUser(id: string) {
  return prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      chars: true,
      serverMessages: true,
    },
  });
}
