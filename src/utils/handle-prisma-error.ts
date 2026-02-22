import { Prisma } from "@prisma/client";
import { DuplicateError, NotFoundError, BadRequestError } from "@/errors";

export function handlePrismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        throw new DuplicateError("Field");

      case "P2025":
        throw new NotFoundError("Record");

      default:
        throw new BadRequestError("Database error");
    }
  }

  throw err;
}
