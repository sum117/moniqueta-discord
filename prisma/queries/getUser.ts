import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export function getUser(id: string) {
  return prisma.user.findUnique({
    where: {
      id: id
    },
    include: {
      chars: {
        include: {
          equipment: true,
          skills: true,
          backpack: true,
          title: true,
          weapons: true
        }
      },
      serverMessages: true
    }
  });
}
