import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function updateChar(charId: number) {
    return prisma.char.update({
        where: {
            id: charId,
        },
        data: {
            isApproved: true,
        },
    });
}