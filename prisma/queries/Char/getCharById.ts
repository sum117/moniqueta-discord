import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function getCharById(charId: number) {
    return prisma.char.findUnique({
        where: {
            id: charId,
        },
        include: {
            equipment: true,
            skills: true,
            backpack: true,
            title: true,
            weapons: true,
        },
    });
}
