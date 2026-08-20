import { describe, it, expect, vi } from "vitest";
import { fileFilter } from "@/app/middlewares/upload.middleware";
import { createImageFilter } from "@/app/middlewares/upload/upload.config";
import { MIME_TO_SAFE_EXT } from "@/app/middlewares/upload/multerStorage";

function fakeFile(originalname: string, mimetype: string): Express.Multer.File {
  return { originalname, mimetype } as Express.Multer.File;
}

describe("upload.middleware — fileFilter (product upload)", () => {
  it("chấp nhận ảnh hợp lệ: extension VÀ mimetype đều đúng whitelist", () => {
    const cb = vi.fn();
    fileFilter({} as any, fakeFile("photo.jpg", "image/jpeg"), cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("TỪ CHỐI file .php giả mạo mimetype 'image/jpeg' (lỗ hổng đã fix)", () => {
    // Đây chính là kịch bản tấn công ban đầu: attacker đặt tên file "shell.php"
    // nhưng khai báo Content-Type "image/jpeg" trong multipart request.
    // Trước khi fix (dùng OR), request này sẽ pass filter. Giờ dùng AND nên
    // phải bị từ chối.
    const cb = vi.fn();
    fileFilter({} as any, fakeFile("shell.php", "image/jpeg"), cb);

    const call = cb.mock.calls[0];
    expect(call[0]).toBeInstanceOf(Error); // phải có lỗi
    expect(call[1]).toBeUndefined(); // không được accept
  });

  it("TỪ CHỐI extension đúng nhưng mimetype không phải ảnh (mimetype giả mạo kiểu khác)", () => {
    const cb = vi.fn();
    fileFilter({} as any, fakeFile("photo.jpg", "application/x-php"), cb);

    expect(cb.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("vẫn cho phép field JSON hợp lệ (variants/specifications) đi qua theo đúng nhánh riêng", () => {
    const cb = vi.fn();
    const file = { fieldname: "variants", originalname: "data.json", mimetype: "application/json" } as any;
    fileFilter({} as any, file, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });
});

describe("upload.config — createImageFilter (avatar/blog/brand/campaign/category/media/settings)", () => {
  const filter = createImageFilter("Avatar");

  it("chấp nhận ảnh hợp lệ", () => {
    const cb = vi.fn();
    filter({} as any, fakeFile("avatar.png", "image/png"), cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("TỪ CHỐI .php giả mạo mimetype ảnh (lỗ hổng nghiêm trọng nhất đã fix — trước đây KHÔNG check extension)", () => {
    // Trước khi fix, filter này CHỈ check `mimetype.startsWith("image/")`
    // — hoàn toàn không kiểm tra extension. File "shell.php" kèm mimetype
    // "image/png" sẽ pass filter và được lưu với extension .php trên đĩa.
    const cb = vi.fn();
    filter({} as any, fakeFile("shell.php", "image/png"), cb);

    expect(cb.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("TỪ CHỐI file .exe giả mạo mimetype image/jpeg", () => {
    const cb = vi.fn();
    filter({} as any, fakeFile("virus.exe", "image/jpeg"), cb);

    expect(cb.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

describe("multerStorage — MIME_TO_SAFE_EXT (extension trên đĩa luôn do server suy ra từ mime)", () => {
  it("chỉ map các mimetype ảnh đã whitelist, không có phần tử thực thi được (.php, .exe, .sh...)", () => {
    const dangerousExts = [".php", ".exe", ".sh", ".js", ".html", ".svg"];
    const mappedExts = Object.values(MIME_TO_SAFE_EXT);

    for (const ext of dangerousExts) {
      expect(mappedExts).not.toContain(ext);
    }
  });

  it("map đúng mimetype ảnh hợp lệ sang extension tương ứng", () => {
    expect(MIME_TO_SAFE_EXT["image/jpeg"]).toBe(".jpg");
    expect(MIME_TO_SAFE_EXT["image/png"]).toBe(".png");
  });
});
