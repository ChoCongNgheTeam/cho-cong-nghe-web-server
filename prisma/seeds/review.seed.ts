import { PrismaClient, ReviewStatus } from "@prisma/client";

const prisma = new PrismaClient();

const reviewsData = [
  {
    userId: "11111111-1111-1111-1111-111111111111",
    orderItemId: "22222222-2222-2222-2222-222222222222",
    rating: 5,
    comment: "Sản phẩm rất tốt, pin trâu, màn hình đẹp",
    isApproved: "APPROVED",
  },
];

export async function seedReviews() {
  console.log("Seeding reviews...");

  for (const review of reviewsData) {
    try {
      await prisma.reviews.upsert({
        where: {
          orderItemId: review.orderItemId, // unique
        },
        update: {
          rating: review.rating,
          comment: review.comment,
          isApproved: review.isApproved as ReviewStatus,
        },
        create: {
          userId: review.userId,
          orderItemId: review.orderItemId,
          rating: review.rating,
          comment: review.comment,
          isApproved: review.isApproved as ReviewStatus,
        },
      });
    } catch (error) {
      console.error(`❌ Failed to seed review for orderItemId=${review.orderItemId}`, error);
    }
  }

  console.log("✅ Reviews seeded");
}
