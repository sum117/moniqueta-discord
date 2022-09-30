import {PrismaClient} from '@prisma/client';
import {Snowflake} from 'discord.js';

const prisma = new PrismaClient();

export class handleCharSubmission {
  public static async create(authorId: string, charId: number, messageIdBundle: Snowflake[]) {
    return prisma.charSubmission.create({
      data: {
        authorId: authorId,
        messageIdBundle: messageIdBundle.join(','),
        charId: charId
      }
    });
  }

  public static async delete(charId: number) {
    return prisma.charSubmission.deleteMany({
      where: {
        charId: charId
      }
    });
  }

  public static async get(charId: number) {
    return prisma.charSubmission.findFirst({
      where: {
        charId: charId
      }
    });
  }
}
