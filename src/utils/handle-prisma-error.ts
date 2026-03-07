import { Prisma } from "@prisma/client";
import { DuplicateError, NotFoundError, BadRequestError } from "@/errors";
import { findRelationsReferencing } from "./prisma-relation-debug";
import { findBlockingRecords } from "./prisma-delete-debugger";

type PrismaErrorContext = {
  deletingUserId?: string;
};

export async function handlePrismaError(err: unknown, context?: PrismaErrorContext): Promise<never> {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const code = err.code;
    const meta = err.meta as Record<string, any> | undefined;

    console.error("========== PRISMA ERROR ==========");
    console.error("Code:", code);
    console.error("Model:", meta?.modelName);
    console.error("Constraint:", meta?.constraint);
    console.error("Field:", meta?.field_name);
    console.error("Meta:", meta);
    console.error("==================================");

    switch (code) {
      case "P2002":
        throw new DuplicateError(`Duplicate value on field: ${meta?.target?.join?.(", ") ?? "unknown"}`);

      case "P2025":
        throw new NotFoundError("Record not found");

      case "P2003":
        throw new BadRequestError(`Foreign key constraint failed on ${meta?.field_name ?? "unknown field"}`);

      case "P2011": {
        const model = meta?.modelName;

        const relations = findRelationsReferencing(model);

        const deletingUserId = context?.deletingUserId;

        if (!deletingUserId) {
          throw new BadRequestError("Delete failed due to related records");
        }

        const blocking = await findBlockingRecords(deletingUserId, relations);

        console.error("REAL blocking tables:", blocking);

        throw new BadRequestError(`Cannot delete user. Related data exists in: ${blocking.map((b) => `${b.table}(${b.count})`).join(", ")}`);
      }

      default:
        throw new BadRequestError("Database error");
    }
  }

  throw err;
}
