// Fix BigInt serialization khi JSON.stringify (Prisma trả BigInt cho một số cột số lớn).
// Side-effect toàn cục — chỉ import 1 lần (import "./promotion.helpers") ở entry point của module.
// TODO: nếu module khác trong app cũng patch BigInt.prototype.toJSON tương tự, nên gom về
// 1 bootstrap dùng chung ở tầng app thay vì lặp lại ở từng module.
if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function (this: bigint) {
    return this.toString();
  };
}
