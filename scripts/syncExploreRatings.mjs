import prisma from "../src/libs/database.js";

async function ensureReviewerUser({ phoneNumber, firstName, middleName, lastName, governmentId }) {
  const existing = await prisma.user.findFirst({ where: { phoneNumber } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      governmentId,
      status: "ACTIVE",
      role: "USER",
    },
  });
}

async function createReviewIfMissing({ workerProfileId, userId, rating, comment }) {
  const existing = await prisma.workerReview.findFirst({
    where: { workerProfileId, userId },
    select: { id: true },
  });

  if (existing) return;

  await prisma.workerReview.create({
    data: { workerProfileId, userId, rating, comment },
  });
}

async function main() {
  const cairo = await prisma.government.findFirst({ where: { name: "Cairo" }, select: { id: true } });
  const giza = await prisma.government.findFirst({ where: { name: "Giza" }, select: { id: true } });

  const fallbackGovernmentId = cairo?.id || giza?.id || null;
  if (!fallbackGovernmentId) {
    throw new Error("No Cairo/Giza government found to attach reviewer users.");
  }

  const reviewer1 = await ensureReviewerUser({
    phoneNumber: "+201555555551",
    firstName: "سارة",
    middleName: "حسن",
    lastName: "محمود",
    governmentId: fallbackGovernmentId,
  });
  const reviewer2 = await ensureReviewerUser({
    phoneNumber: "+201555555552",
    firstName: "مريم",
    middleName: "محمد",
    lastName: "علي",
    governmentId: fallbackGovernmentId,
  });
  const reviewer3 = await ensureReviewerUser({
    phoneNumber: "+201555555553",
    firstName: "عمر",
    middleName: "أحمد",
    lastName: "سعيد",
    governmentId: fallbackGovernmentId,
  });

  const wp1 = await prisma.workerProfile.findFirst({ where: { user: { phoneNumber: "+201111111111" } }, select: { id: true } });
  const wp2 = await prisma.workerProfile.findFirst({ where: { user: { phoneNumber: "+201222222222" } }, select: { id: true } });
  const wp3 = await prisma.workerProfile.findFirst({ where: { user: { phoneNumber: "+201333333333" } }, select: { id: true } });

  if (wp1?.id) {
    await createReviewIfMissing({ workerProfileId: wp1.id, userId: reviewer1.id, rating: 5, comment: "شغل ممتاز ودقة عالية" });
    await createReviewIfMissing({ workerProfileId: wp1.id, userId: reviewer2.id, rating: 4.5, comment: "ملتزم بالمواعيد" });
    await createReviewIfMissing({ workerProfileId: wp1.id, userId: reviewer3.id, rating: 5, comment: "نتيجة ممتازة" });
  }

  if (wp2?.id) {
    await createReviewIfMissing({ workerProfileId: wp2.id, userId: reviewer1.id, rating: 5, comment: "حل المشكلة بسرعة" });
    await createReviewIfMissing({ workerProfileId: wp2.id, userId: reviewer2.id, rating: 4, comment: "جيد جدا" });
  }

  if (wp3?.id) {
    await createReviewIfMissing({ workerProfileId: wp3.id, userId: reviewer1.id, rating: 5, comment: "تنفيذ احترافي" });
    await createReviewIfMissing({ workerProfileId: wp3.id, userId: reviewer2.id, rating: 5, comment: "ممتاز" });
    await createReviewIfMissing({ workerProfileId: wp3.id, userId: reviewer3.id, rating: 4.7, comment: "خبرة واضحة" });
  }

  const approvedWorkers = await prisma.workerProfile.findMany({
    where: { isApproved: true },
    select: {
      id: true,
      reviews: { select: { rating: true } },
    },
  });

  for (const worker of approvedWorkers) {
    const total = worker.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = worker.reviews.length ? Number((total / worker.reviews.length).toFixed(1)) : 0;
    await prisma.workerProfile.update({ where: { id: worker.id }, data: { rating: avg } });
  }

  const verify = await prisma.workerProfile.findMany({
    where: { isApproved: true },
    select: {
      id: true,
      rating: true,
      user: { select: { phoneNumber: true, firstName: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { id: "asc" },
    take: 5,
  });

  console.log("Sync complete", JSON.stringify(verify, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
