import { env } from '../../../config/env';
import { aiContentService } from './ai-content.service';

async function main() {
  try {
    const res = await aiContentService.suggestSpecifications({
      productName: 'Điện thoại Samsung Galaxy S24 Ultra 5G 256GB',
      categoryId: '11111111-1111-1111-1111-111111111111',
      specifications: [
        { specificationId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0', name: 'Màn hình' },
        { specificationId: 'b1c2d3e4-f5a6-7890-1234-56789abcdef1', name: 'Dung lượng RAM', unit: 'GB' },
        { specificationId: 'c1d2e3f4-a5b6-7890-1234-56789abcdef2', name: 'Trọng lượng', unit: 'kg' },
        { specificationId: 'd1d2e3f4-a5b6-7890-1234-56789abcdef2', name: 'Thông số không tồn tại' }
      ],
      onlyEmpty: true
    });
    console.log("SUCCESS:");
    console.dir(res, { depth: null });
  } catch (err) {
    console.error("ERROR:", err);
  }
}

main();
