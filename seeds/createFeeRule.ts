import prisma from "../src/libs/database";
const DEFAULT_FEE_PERCENTAGE = 15;

async function main() {
  
  const x = await prisma.feeRule.create({
    data: {
      percentage: 3,
      effectiveFrom: new Date(),
      isActive: true,
      description: 'PayMOB fee',
    },
  });
  console.log(`Created default fee rule: ${x.percentage}%`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
