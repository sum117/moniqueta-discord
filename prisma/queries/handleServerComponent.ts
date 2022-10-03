import {PrismaClient} from '@prisma/client';
import {Snowflake} from 'discord.js';

import {ErrorMessage} from '../../src/util/ErrorMessage';
const prisma = new PrismaClient();

export class HandleServerComponent {
  public static async create(
    instance: 'CharSheet' | 'RoleSelector',
    channelId: Snowflake,
    messageId: Snowflake
  ) {
    if (channelId && messageId) {
      try {
        await prisma.serverComponents.create({
          data: {
            instance: instance,
            channelId: channelId,
            messageId: messageId
          }
        });
        return true;
      } catch (error) {
        console.log(ErrorMessage.DatabaseError);
      }
    }
  }

  public static async delete(instance: 'CharSheet' | 'RoleSelector') {
    const deleted = await prisma.serverComponents.delete({
      where: {
        instance: instance
      }
    });
    if (deleted) return true;
    return false;
  }

  public static async get(instance: 'CharSheet' | 'RoleSelector') {
    const found = await prisma.serverComponents.findUnique({
      where: {
        instance: instance
      }
    });
    if (found) return found;
    return false;
  }
}
