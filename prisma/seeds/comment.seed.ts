import { PrismaClient, CommentTargetType } from "@prisma/client";
import { commentSeeds } from "../seed-data/comments";

export async function seedComments(prisma: PrismaClient) {
  console.log("🌱 seeding comments...");

  let createdCount = 0;
  let skippedCount = 0;
  let replyCount = 0;

  // Tạo map để tra cứu parentId sau (dùng content làm key tạm thời - chỉ phù hợp seed nhỏ)
  const commentMap = new Map<string, string>(); // content -> id

  for (const data of commentSeeds) {
    try {
      const user = await prisma.users.findUnique({
        where: { email: data.userEmail },
        select: { id: true },
      });

      if (!user) {
        console.warn(`⚠️ Not found user:  ${data.userEmail}`);
        skippedCount++;
        continue;
      }

      let targetId: string | null = null;

      // Tìm targetId dựa trên targetType
      if (data.targetType === "BLOG") {
        const blog = await prisma.blogs.findUnique({
          where: { slug: data.targetSlug },
          select: { id: true },
        });
        if (blog) targetId = blog.id;
      } else if (data.targetType === "PRODUCT") {
        const product = await prisma.products.findUnique({
          where: { slug: data.targetSlug },
          select: { id: true },
        });
        if (product) targetId = product.id;
      } else if (data.targetType === "PAGE") {
        // Nếu có model page sau này thì xử lý tương tự
        console.warn(`⚠️ Page not supported yet`);
        skippedCount++;
        continue;
      }

      if (!targetId) {
        console.warn(`⚠️ Not found target: ${data.targetType} / ${data.targetSlug} → bỏ qua`);
        skippedCount++;
        continue;
      }

      let parentId: string | undefined = undefined;

      // Nếu là reply → tìm parentId dựa trên content của parent
      if (data.parentContent) {
        const parentIdFound = commentMap.get(data.parentContent);
        if (parentIdFound) {
          parentId = parentIdFound;
        } else {
          console.warn(`⚠️ Không tìm thấy parent comment để reply → tạo comment cấp 1`);
        }
      }

      const comment = await prisma.comments.create({
        data: {
          userId: user.id,
          content: data.content,
          targetType: data.targetType as CommentTargetType,
          targetId,
          parentId,
          isApproved: data.isApproved ?? false,
        },
      });

      // Lưu vào map để các reply sau dùng
      commentMap.set(data.content, comment.id);

      createdCount++;
      if (parentId) replyCount++;

      console.log(
        `  → Created comment ${parentId ? "(reply)" : ""} cho ${data.targetType}/${data.targetSlug}: "${data.content.substring(0, 60)}..."`,
      );
    } catch (err) {
      console.error(`Lỗi khi seed comment "${data.content.substring(0, 40)}...":`, err);
      skippedCount++;
    }
  }

  console.log(`   - Total created: ${createdCount}`);
  console.log(`   - Replies: ${replyCount}`);
  console.log(`   - Skipped: ${skippedCount}`);

  return { created: createdCount, replies: replyCount, skipped: skippedCount };
}
