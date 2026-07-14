import prisma from "@/config/db";

export type SettingDataType = "BOOLEAN" | "NUMBER" | "JSON" | "STRING";

// FINDS

export const findByGroup = async (group: string) => {
  return prisma.system_settings.findMany({ where: { group } });
};

export const findAll = async () => {
  return prisma.system_settings.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
};

/** Query trực tiếp 1 setting theo group+key (dùng unique index group_key) — tránh fetch cả group chỉ để lấy 1 giá trị */
export const findOne = async (group: string, key: string) => {
  return prisma.system_settings.findUnique({ where: { group_key: { group, key } } });
};

// MUTATIONS

export const upsertMany = async (group: string, entries: { key: string; value: string; dataType: SettingDataType }[], updatedBy: string) => {
  return prisma.$transaction(
    entries.map((e) =>
      prisma.system_settings.upsert({
        where: { group_key: { group, key: e.key } },
        create: { group, key: e.key, value: e.value, dataType: e.dataType, updatedBy },
        update: { value: e.value, updatedBy },
      }),
    ),
  );
};
