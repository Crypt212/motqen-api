import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { PrismaClient } = pkg;

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

// Craftsman Specializations Data
const specializations = [
  {
    name: "Carpentry",
    subSpecializations: [
      "Furniture Making",
      "Wood Carving",
      "Cabinet Making",
      "Door & Window Installation",
      "Kitchen Cabinets",
    ],
  },
  {
    name: "Plumbing",
    subSpecializations: [
      "Water Piping",
      "Drainage Systems",
      "Water Heater Installation",
      "Bathroom Fixtures",
      "Pipe Leak Repair",
    ],
  },
  {
    name: "Electrical",
    subSpecializations: [
      "Wiring & Rewiring",
      "Switchboard Installation",
      "Lighting Installation",
      "AC Installation",
      "Generator Installation",
    ],
  },
  {
    name: "Painting",
    subSpecializations: [
      "Interior Painting",
      "Exterior Painting",
      "Wall Textures",
      "Decorative Painting",
      "Waterproofing",
    ],
  },
  {
    name: "Tiling",
    subSpecializations: [
      "Floor Tiling",
      "Wall Tiling",
      "Mosaic Work",
      "Marble Installation",
      "Grouting & Sealing",
    ],
  },
  {
    name: "Masonry",
    subSpecializations: [
      "Bricklaying",
      "Block Work",
      "Stone Masonry",
      "Concrete Work",
      "Wall Repair",
    ],
  },
  {
    name: "Aluminum",
    subSpecializations: [
      "Window Frames",
      "Door Frames",
      "Glass Work",
      "Curtain Walls",
      "Partition Walls",
    ],
  },
  {
    name: "Welding",
    subSpecializations: [
      "Iron Work",
      "Steel Structures",
      "Gate & Fence",
      "Metal Furniture",
      "Pipe Welding",
    ],
  },
  {
    name: "HVAC",
    subSpecializations: [
      "AC Installation",
      "AC Repair",
      "Ventilation Systems",
      "Central Heating",
      "Refrigeration",
    ],
  },
  {
    name: "Flooring",
    subSpecializations: [
      "Wood Flooring",
      "Laminate Flooring",
      "Vinyl Flooring",
      "Carpet Installation",
      "Parquet",
    ],
  },
];

async function main() {
  console.log("Starting database seeding...");

  try {
    console.log("\n--- Seeding Specializations and Sub-specializations ---");

    for (const spec of specializations) {
      // Check if specialization already exists
      const existingSpec = await prisma.specialization.findFirst({
        where: { name: spec.name },
      });

      if (!existingSpec) {
        const createdSpec = await prisma.specialization.create({
          data: { 
            name: spec.name,
            nameAr: spec.nameAr || spec.name,
            category: spec.category || 'DEFAULTCATEGORY'
          },
        });
        console.log(`Created specialization: ${createdSpec.name}`);

        // Create sub-specializations
        for (const subSpecName of spec.subSpecializations) {
          await prisma.subSpecialization.create({
            data: {
              name: subSpecName,
              nameAr: subSpecName,
              mainSpecializationId: createdSpec.id,
            },
          });
          console.log(`  - Created sub-specialization: ${subSpecName}`);
        }
      } else {
        console.log(`Specialization already exists: ${spec.name}`);
      }
    }

    console.log("\n--- Database seeding completed successfully! ---");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

}

main();
