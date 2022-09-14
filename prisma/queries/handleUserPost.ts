import { CommandInteraction, Message } from 'discord.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handleUserPost(
  arg: Message | CommandInteraction,
  sentPostMessage: Message,
  method: 'create' | 'delete' = 'create',
) {
  if (method === 'create' && arg instanceof Message) {
    await prisma.user.update({
      where: {
        id: arg.author.id,
      },
      data: {
        lastMessageId: sentPostMessage.id,
      },
    });
    await prisma.char.update({
      where: {
        chosenById: arg.author.id,
      },

      data: {
        expCache: {
          increment: arg.content.length,
        },
        expTotal: {
          increment: arg.content.length,
        },
      },
    });
    await prisma.serverMessages.create({
      data: {
        messageId: sentPostMessage.id,
        authorId: arg.author.id,
      },
    });
  } else if (method === 'delete' && arg instanceof CommandInteraction) {
    const toDelete = await prisma.serverMessages.findUnique({
      where: {
        messageId: sentPostMessage.id,
      },
    });
    if (toDelete?.authorId === arg.user.id) {
      await prisma?.serverMessages.delete({
        where: {
          messageId: sentPostMessage.id,
        },
      });
      const { lastMessageId } = (await prisma.user.findUnique({
        where: {
          id: arg.user.id,
        },
        select: {
          lastMessageId: true,
        },
      })) ?? { lastMessageId: null };
      const isLastMessage = lastMessageId === sentPostMessage.id;
      if (lastMessageId)
        await prisma.user.update({
          where: {
            id: arg.user.id,
          },
          data: {
            lastMessageId: isLastMessage ? undefined : lastMessageId,
          },
        });
      else return false;
    } else return false;
  }
  return true;
}
