import prisma from "@/config/db";
import { SettingGroup } from "./settings.validation";

export const findByGroup = async (group: string) => {
  return prisma.system_settings.findMany({ where: { group } });
};

export const findAll = async () => {
  return prisma.system_settings.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
};

export const upsertMany = async (group: string, entries: { key: string; value: string; dataType: string }[], updatedBy: string) => {
  return prisma.$transaction(
    entries.map((e) =>
      prisma.system_settings.upsert({
        where: { group_key: { group, key: e.key } },
        create: { group, key: e.key, value: e.value, dataType: e.dataType as any, updatedBy },
        update: { value: e.value, updatedBy },
      }),
    ),
  );
};
