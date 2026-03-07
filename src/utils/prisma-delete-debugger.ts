import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Relation = {
  model: string;
  field: string;
};

export async function findBlockingRecords(userId: string, relations: string[]) {
  const blocking: { table: string; count: number }[] = [];

  for (const relation of relations) {
    const [model, field] = relation.split(".");

    try {
      // prisma[model] dynamic access
      const delegate = (prisma as any)[model];

      if (!delegate?.count) continue;

      const count = await delegate.count({
        where: { [field]: userId },
      });

      if (count > 0) {
        blocking.push({ table: model, count });
      }
    } catch (err) {
      console.warn(`Skip checking ${model}`);
    }
  }

  return blocking;
}
