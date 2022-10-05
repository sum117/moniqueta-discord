import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function setUserFreeStyle(userId: string, isFreeStyling: boolean) {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isFreeStyling
    }
  });
  return user;
}
