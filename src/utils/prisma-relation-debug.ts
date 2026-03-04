import { Prisma } from "@prisma/client";

export function findRelationsReferencing(modelName: string) {
  const models = Prisma.dmmf.datamodel.models;

  const relations: string[] = [];

  for (const model of models) {
    for (const field of model.fields) {
      if (field.relationName && field.type === modelName && field.relationFromFields?.length) {
        relations.push(`${model.name}.${field.relationFromFields.join(", ")}`);
      }
    }
  }

  return relations;
}
