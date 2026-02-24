import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Initialize Prisma Client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});


async function main() {
  // console.log((await prisma.government.findMany({})));
  // await prisma.user.deleteMany({});
  // const user = await prisma.user.create({
  //   data: {
  //     firstName: "tester",
  //     middleName: "test",
  //     lastName: "testest",
  //     governmentId: "86133bca-0d5a-41cf-ace1-c5d238ba972a",
  //     cityId: (await prisma.city.findFirst({ })).id,
  //   }
  // });
  // const profile = await prisma.clientProfile.create({ data: { userId: user.id, address: "asfsadfa" }});
  // await prisma.user.deleteMany({});
  //
  // const mains = (await prisma.specialization.findMany({ })).slice(0, 3);
  // const tree = mains.map((main) => {
  //   return { mainId: main.id, subIds: [] };
  // })
  // for (let i = 0; i < mains.length; i++) {
  //   const subIds = (await prisma.subSpecialization.findMany({ where: { mainSpecializationId: mains[i].id } })).slice(0, 2).map(({ id }) => id);
  //   tree[i].subIds = subIds;
  // }

  // console.log(tree);
}
// async function main() {
//   console.log("Starting database seeding...");
//
//   try {
//     // 1. Seed Specializations and Sub-specializations
//     console.log("\n--- Seeding Specializations and Sub-specializations ---");
//
//     for (const spec of specializations) {
//       // Check if specialization already exists
//       const existingSpec = await prisma.specialization.findFirst({
//         where: { name: spec.name },
//       });
//
//       if (!existingSpec) {
//         const createdSpec = await prisma.specialization.create({
//           data: { name: spec.name },
//         });
//         console.log(`Created specialization: ${createdSpec.name}`);
//
//         // Create sub-specializations
//         for (const subSpecName of spec.subSpecializations) {
//           await prisma.subSpecialization.create({
//             data: {
//               name: subSpecName,
//               mainSpecializationId: createdSpec.id,
//             },
//           });
//           console.log(`  - Created sub-specialization: ${subSpecName}`);
//         }
//       } else {
//         console.log(`Specialization already exists: ${spec.name}`);
//       }
//     }
//
//     // 2. Seed Governments and Cities
//     console.log("\n--- Seeding Governments and Cities ---");
//
//     for (const gov of egyptData) {
//       // Check if government already exists
//       const existingGov = await prisma.government.findFirst({
//         where: { name: gov.name },
//       });
//
//       if (!existingGov) {
//         const createdGov = await prisma.government.create({
//           data: { name: gov.name },
//         });
//         console.log(`Created government: ${createdGov.name}`);
//
//         // Create cities
//         for (const cityName of gov.cities) {
//           await prisma.city.create({
//             data: {
//               name: cityName,
//               governmentId: createdGov.id,
//             },
//           });
//           console.log(`  - Created city: ${cityName}`);
//         }
//       } else {
//         console.log(`Government already exists: ${gov.name}`);
//       }
//     }
//
//     console.log("\n--- Database seeding completed successfully! ---");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

main();
