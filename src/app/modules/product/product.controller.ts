import { Request, Response } from "express";
import * as productService from "./product.service";
import * as productRepo from "./product.repository";
import { listProductsSchema, createProductSchema } from "./product.validation";
import { uploadImage, deleteImage } from "src/services/cloudinary.service"; 
import fs from "fs";


// =====================
// === PUBLIC CONTROLLERS ===
// =====================


// Lấy danh sách sản phẩm (public)
export const getProductsPublicHandler = async (req: Request, res: Response) => {
  try {
    const query = listProductsSchema.parse(req.query);
    const result = await productService.getProductsPublic(query);

    res.json({
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy chi tiết sản phẩm theo slug (public)
export const getProductBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);

    res.json({
      data: product,
      message: "Lấy chi tiết sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// =====================
// === ADMIN CONTROLLERS ===
// =====================

// Lấy danh sách sản phẩm (admin)
export const getProductsAdminHandler = async (req: Request, res: Response) => {
  try {
    const query = listProductsSchema.parse(req.query);
    const result = await productService.getProductsAdmin(query);

    res.json({
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy chi tiết sản phẩm theo ID (admin)
export const getProductDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.json({
      data: product,
      message: "Lấy chi tiết sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Tạo sản phẩm
// export const createProductHandler = async (req: Request, res: Response) => {
//   try {
//     const product = await productService.createProduct(req.body);

//     res.status(201).json({
//       data: product,
//       message: "Tạo sản phẩm thành công",
//     });
//   } catch (error: any) {
//     const status = error.statusCode || 500;
//     res.status(status).json({ message: error.message || "Lỗi server" });
//   }
// };

export const createProductHandler = async (req: Request, res: Response) => {
  const tempFiles: string[] = [];

  try {
    // 1. Chuẩn bị dữ liệu thô (Raw Body)
    // Mặc định lấy từ req.body (nơi chứa các key tách lẻ như name, brandId...)
    let rawBody: any = { ...req.body };

    // Nếu người dùng vẫn dùng cách cũ (gửi key 'data' chứa JSON), ta merge nó vào
    if (req.body.data && typeof req.body.data === 'string') {
      try {
        const parsedData = JSON.parse(req.body.data);
        rawBody = { ...rawBody, ...parsedData };
      } catch (e) {
        throw new Error("Format dữ liệu JSON trong field 'data' bị sai");
      }
    }

    // 2. Parse các trường phức tạp (Mảng/Object) nếu chúng đang là String
    // Vì multipart/form-data gửi variants="[{...}]" dưới dạng string
    const fieldsToParse = ['variants', 'highlights', 'categories'];
    
    fieldsToParse.forEach(field => {
      if (rawBody[field] && typeof rawBody[field] === 'string') {
        try {
          rawBody[field] = JSON.parse(rawBody[field]);
        } catch (e) {
          throw new Error(`Format JSON của field '${field}' bị sai`);
        }
      }
    });

    // 3. Xử lý Upload ảnh (Mapping file vào variants)
    const files = req.files as Express.Multer.File[];
    
    if (files && files.length > 0) {
      files.forEach(f => tempFiles.push(f.path)); // Lưu path để cleanup

      // Kiểm tra xem variants có phải là mảng sau khi parse không
      if (rawBody.variants && Array.isArray(rawBody.variants)) {
        
        await Promise.all(rawBody.variants.map(async (variant: any, index: number) => {
          // Tìm file tương ứng: variant_0, variant_1...
          const variantFiles = files.filter(f => f.fieldname === `variant_${index}`);

          if (variantFiles.length > 0) {
            const uploadPromises = variantFiles.map(file => uploadImage(file.path, "products"));
            const uploadedImages = await Promise.all(uploadPromises);

            variant.images = uploadedImages.map(img => ({
              imageUrl: img.url,
              publicId: img.publicId,
              altText: variant.code || rawBody.name
            }));
          } else {
            variant.images = variant.images || []; 
          }
        }));
      }
    }

    // 4. Validate dữ liệu (Zod sẽ lo việc ép kiểu số/boolean nhờ z.coerce)
    const validatedData = createProductSchema.parse(rawBody);

    // 5. Gọi Service
    const product = await productService.createProduct(validatedData);

    // Cleanup file tạm
    tempFiles.forEach(path => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    });

    res.status(201).json({
      data: product,
      message: "Tạo sản phẩm thành công",
    });

  } catch (error: any) {
    // Cleanup file tạm khi lỗi
    tempFiles.forEach(path => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    });

    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Dữ liệu không hợp lệ", 
        errors: error.errors 
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Cập nhật sản phẩm
export const updateProductHandler = async (req: Request, res: Response) => {
  // Mảng lưu đường dẫn file tạm để xóa sau khi xong (dù thành công hay thất bại)
  const tempFiles: string[] = [];

  try {
    const { id } = req.params;
    let productInput = req.body;
    const oldImages: Array<{ id: string; imageUrl: string }> = [];

    // --- CHECK 1: Lấy ảnh cũ nếu ko có upload ảnh mới ---
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const existingImages = await productRepo.getVariantImagesByProductId(id);
      oldImages.push(...existingImages);
    }

    // --- CHECK 2: Xử lý trường hợp gửi Multipart (Có file hoặc có field 'data') ---
    if (req.files || (req.body.data && typeof req.body.data === 'string')) {
      
      // 1. Parse JSON từ field 'data' (nếu có)
      if (req.body.data) {
        try {
          productInput = JSON.parse(req.body.data);
        } catch (e) {
          throw new Error("Format dữ liệu JSON trong field 'data' bị sai");
        }
      }

      // 2. Xử lý Upload ảnh (nếu có file)
      if (files && files.length > 0) {
        // Lưu lại path để tí nữa xóa
        files.forEach(f => tempFiles.push(f.path));

        // Logic Mapping: Duyệt qua variants để tìm ảnh tương ứng
        // Quy ước: Client gửi ảnh cho variant thứ i bằng field name "variant_i"
        if (productInput.variants && Array.isArray(productInput.variants)) {
          
          await Promise.all(productInput.variants.map(async (variant: any, index: number) => {
            // Lọc ra các file thuộc về variant này (VD: variant_0, variant_1)
            const variantFiles = files.filter(f => f.fieldname === `variant_${index}`);

            if (variantFiles.length > 0) {
              // Upload lên Cloudinary
              const uploadPromises = variantFiles.map(file => uploadImage(file.path, "products"));
              const uploadedImages = await Promise.all(uploadPromises);

              // Gán kết quả vào mảng images của variant
              variant.images = uploadedImages.map(img => ({
                imageUrl: img.url,
                publicId: img.publicId,
                altText: variant.code || productInput.name // Tự động tạo alt text
              }));
            } else {
              // Nếu không có ảnh thì giữ nguyên images cũ (nếu không update variant.images)
              variant.images = variant.images || []; 
            }
          }));
        }
      }
    }

    // --- CHECK 3: Gọi Service cập nhật sản phẩm ---
    const product = await productService.updateProduct(id, productInput);

    // --- CLEANUP: Xóa ảnh cũ từ Cloudinary (chỉ nếu upload ảnh mới thành công) ---
    if (oldImages.length > 0) {
      // Trích extract publicId từ URL hoặc xóa trực tiếp từ URL
      // Format URL từ Cloudinary: https://res.cloudinary.com/[cloud_name]/image/upload/[public_id]
      const deletePromises = oldImages.map(async (img) => {
        try {
          // Trích publicId từ URL (công thức: lấy phần sau /upload/)
          const urlParts = img.imageUrl.split('/upload/');
          if (urlParts.length === 2) {
            const publicId = urlParts[1].split('.')[0]; // Loại bỏ extension
            await deleteImage(publicId);
          }
        } catch (err) {
          // Log lỗi nhưng không dừng quy trình chính
          console.error(`Lỗi xóa ảnh cũ: ${img.imageUrl}`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    // --- CLEANUP: Xóa file tạm ---
    tempFiles.forEach(path => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    });

    res.json({
      data: product,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error: any) {
    // --- CLEANUP KHI LỖI ---
    tempFiles.forEach(path => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    });

    // Xử lý lỗi validation của Zod trả về format đẹp
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Dữ liệu không hợp lệ", 
        errors: error.errors 
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Xóa sản phẩm
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    res.json({
      message: "Xóa sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};
