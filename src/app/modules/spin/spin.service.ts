import prisma from "@/config/db";
import * as repo from "./spin.repository";
import { createAndSend } from "../notification/notification.service";
import { NotFoundError, BadRequestError } from "@/errors";
import { CreatePrizeInput, UpdatePrizeInput } from "./spin.validation";
import { SpinStatusResponse, SpinResultResponse } from "./spin.types";

const assertPrizeExists = async (id: string) => {
  const prize = await repo.findPrizeById(id);
  if (!prize) throw new NotFoundError("Phần thưởng");
  return prize;
};

// Chặn sớm việc gán voucher đã hết hạn/tắt active vào phần thưởng — tránh trường hợp
// user quay trúng nhưng ra checkout lại không áp được mã (voucher không hợp lệ).
const assertVoucherUsableForPrize = async (voucherId: string) => {
  const voucher = await repo.findVoucherForValidation(voucherId);
  if (!voucher) throw new NotFoundError("Voucher");
  if (!voucher.isActive) throw new BadRequestError(`Voucher "${voucher.code}" đang bị tắt hoạt động — không thể gán làm phần thưởng.`);
  if (voucher.endDate && voucher.endDate < new Date()) {
    throw new BadRequestError(`Voucher "${voucher.code}" đã hết hạn — không thể gán làm phần thưởng.`);
  }
};

// ============================================================================
// ADMIN
// ============================================================================

export const getPrizesAdmin = async () => repo.findAllPrizesAdmin();

export const getPrizeDetail = async (id: string) => assertPrizeExists(id);

export const createPrize = async (data: CreatePrizeInput) => {
  if (data.voucherId) await assertVoucherUsableForPrize(data.voucherId);
  return repo.create(data);
};

export const updatePrize = async (id: string, data: UpdatePrizeInput) => {
  const prize = await assertPrizeExists(id);

  if (data.voucherId) await assertVoucherUsableForPrize(data.voucherId);

  // Nếu đang bỏ giới hạn (totalBudget -> có giá trị) hoặc tắt active của prize KHÔNG GIỚI HẠN
  // duy nhất còn lại → chặn, vì sẽ làm mất "lưới an toàn" khiến pool có thể rỗng
  const willRemoveUnlimitedSafetyNet = (data.totalBudget !== undefined && data.totalBudget !== null && prize.totalBudget === null) || (data.isActive === false && prize.totalBudget === null);

  if (willRemoveUnlimitedSafetyNet) {
    const otherUnlimited = await repo.countActiveUnlimitedPrizes(id);
    if (otherUnlimited === 0) {
      throw new BadRequestError("Đây là phần thưởng KHÔNG GIỚI HẠN duy nhất đang active — cần giữ lại ít nhất 1 phần thưởng không giới hạn để vòng quay luôn có kết quả.");
    }
  }

  return repo.update(id, data);
};

export const deletePrize = async (id: string) => {
  const prize = await assertPrizeExists(id);

  if (prize.isActive && prize.totalBudget === null) {
    const otherUnlimited = await repo.countActiveUnlimitedPrizes(id);
    if (otherUnlimited === 0) {
      throw new BadRequestError("Đây là phần thưởng KHÔNG GIỚI HẠN duy nhất đang active — cần tạo phần thưởng không giới hạn khác trước khi xoá cái này.");
    }
  }

  const entriesCount = await repo.countEntriesForPrize(id);
  if (entriesCount > 0) {
    throw new BadRequestError(`Không thể xoá vì đã có ${entriesCount} lượt quay trúng phần thưởng này. Hãy tắt "Hoạt động" thay vì xoá để giữ lịch sử.`);
  }

  return repo.remove(id);
};

export const getSpinStats = async () => repo.getSpinStats();

// Xoá toàn bộ lịch sử quay + reset awardedCount về 0 — dùng để dọn dữ liệu test
// trước buổi demo/thi thật. KHÔNG xoá cấu hình phần thưởng (spin_prizes vẫn giữ nguyên).
export const resetAllSpinData = async () => repo.resetAllSpinData();

// ============================================================================
// PUBLIC
// ============================================================================

// Public, không cần đăng nhập — chỉ trả về true/false, không lộ thông tin gì khác
export const isSpinAvailable = async (): Promise<boolean> => repo.hasAnyEligiblePrize();

export const getSpinStatus = async (userId: string): Promise<SpinStatusResponse> => {
  const [entry, prizes] = await Promise.all([repo.findEntryByUserId(userId), repo.findAllActivePrizesPublic()]);

  if (entry) {
    const voucherCode = entry.prize.voucherId ? (entry.prize.voucher?.code ?? null) : null;
    return {
      canSpin: false,
      prizes,
      wonPrize: { label: entry.prize.label, voucherCode },
    };
  }

  return { canSpin: true, prizes, wonPrize: null };
};

// Random có trọng số trong danh sách prize còn "sống" (active + còn ngân sách)
const pickWeightedPrize = <T extends { weight: number }>(prizes: T[]): T => {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const prize of prizes) {
    roll -= prize.weight;
    if (roll <= 0) return prize;
  }
  return prizes[prizes.length - 1];
};

export const spin = async (userId: string): Promise<SpinResultResponse> => {
  // Chặn sớm trước khi vào transaction để trả lỗi rõ ràng (transaction vẫn là chốt chặn cuối cùng)
  const existing = await repo.findEntryByUserId(userId);
  if (existing) throw new BadRequestError("Bạn đã quay vòng quay may mắn rồi, mỗi tài khoản chỉ được quay 1 lần.");

  const allActive = await repo.findActivePrizesRaw();
  const eligible = allActive.filter((p) => p.totalBudget === null || p.awardedCount < p.totalBudget);
  if (eligible.length === 0) {
    throw new BadRequestError("Chương trình vòng quay hiện chưa sẵn sàng, vui lòng quay lại sau.");
  }

  const picked = pickWeightedPrize(eligible);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Unique constraint trên spin_entries.userId là chốt chặn cuối cùng chống race condition
      await repo.createEntryTx(tx, userId, picked.id);

      let voucherCode: string | null = null;
      if (picked.voucherId) {
        const stillHasBudget = await repo.incrementAwardedCountTx(tx, picked.id, picked.totalBudget);
        if (!stillHasBudget) {
          // 2 request quay trúng cùng 1 prize giới hạn cùng lúc — huỷ toàn bộ transaction
          // (kể cả spin_entries vừa tạo) để user có thể gọi lại spin() và được random sang prize khác
          throw new BadRequestError("Phần thưởng này vừa hết lượt trúng, vui lòng thử lại.");
        }
        await repo.createVoucherUserTx(tx, picked.voucherId, userId);
        voucherCode = await repo.findVoucherCode(picked.voucherId);
      }

      return { prizeId: picked.id, label: picked.label, voucherCode };
    });

    if (result.voucherCode) {
      try {
        await createAndSend(
          {
            userId,
            type: "VOUCHER_ASSIGNED",
            title: "🎉 Chúc mừng bạn đã trúng thưởng!",
            body: `Bạn vừa quay trúng "${result.label}". Mã voucher: ${result.voucherCode}`,
            data: { voucherCode: result.voucherCode },
          },
          ["IN_APP"],
        );
      } catch {
        // Gửi thông báo thất bại không ảnh hưởng kết quả quay — bỏ qua, không throw
      }
    }

    return result;
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new BadRequestError("Bạn đã quay vòng quay may mắn rồi, mỗi tài khoản chỉ được quay 1 lần.");
    }
    throw err;
  }
};
