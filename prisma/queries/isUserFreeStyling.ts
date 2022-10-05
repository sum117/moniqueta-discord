import {PrismaClient} from '@prisma/client';
import {Snowflake} from 'discord.js';

const prisma = new PrismaClient();

export async function isUserFreeStyling(userId: Snowflake) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      isFreeStyling: true
    }
  });
  return user?.isFreeStyling ?? false;
}
