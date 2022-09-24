import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface NewCharacterProps {
  name: string;
  sum: string;
  phantom: string;
  personality: string;
  gender: string;
  appearance: string;
  ability: string;
  avatar: string;
  authorId: string;
}

export async function createChar(newCharacter: NewCharacterProps) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: newCharacter.authorId },
    });
    if (!user)
      await prisma.user.create({ data: { id: newCharacter.authorId } });
    return await prisma.char.create({
      data: newCharacter,
    });
  } catch (error) {
    console.log("Houve um erro ao salvar o personagem pendente: " + error);
    return false;
  }
}
