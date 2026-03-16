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

// Egyptian Governments and their Cities
const egyptData = [
  {
    name: "Cairo",
    cities: [
      "Maadi",
      "Helwan",
      "New Cairo",
      "El Shorouk",
      "Madinaty",
      "Badr",
      "Shubra El Kheima",
      "El Marg",
      "El Matareya",
      "El Salam",
      "Manshiyat Naser",
      "Rod El Farag",
      "El Zawiyah",
      "Al-Moqattam",
      "Al-Khalifa",
      "Al-Darb Al-Ahmar",
      "Al-Masjid Al-Nabawi",
      "Al-Manshiyah",
      "Al-Azbakeyah",
      "Al-Waily",
      "Al-Muhandisin",
      "Al-Mokatam",
      "Al-Mokattam",
      "Al-Nozha",
      "Al-Mansoura",
      "Al-Mahkama",
    ],
  },
  {
    name: "Alexandria",
    cities: [
      "Montaza",
      "Maamoura",
      "Alamein",
      "Kafr El Sheikh",
      "Dekhela",
      "El Mahalla El Kubra",
      "Borg El Arab",
      "Marina",
      "Al中添加更多城市",
    ],
  },
  {
    name: "Giza",
    cities: [
      "6th of October",
      "Sheikh Zayed",
      "Dokki",
      "Mohandessin",
      "Agouza",
      "Elharam",
      "Imbaba",
      "Bulaq",
      "Kerdasa",
      "Al-Moqattam",
      "Al-Haram",
      "Al-Mansoura",
    ],
  },
  {
    name: "Qalyubia",
    cities: [
      "Banha",
      "Qalyub",
      "Shubra El Kheima",
      "Al Qanater",
      "Khanka",
      "Kafr Shukr",
      "Tiba",
      "Sinsin",
      "Al-Masjid",
      "Sheikh Hammad",
    ],
  },
  {
    name: "Sharqia",
    cities: [
      "Zagazig",
      "Belbes",
      "Al Husseiniya",
      "Faqous",
      "Hihya",
      "Al Ibrahimiya",
      "Minya Al Qamh",
      "Abu Kabir",
      "Salam",
      "Kafr Saqr",
      "Deir Balah",
      "Mashtoul El Souq",
      "Qareen",
      "Al Anwar",
    ],
  },
  {
    name: "Dakahlia",
    cities: [
      "Mansoura",
      "Talkha",
      "Nabaroh",
      "Dekernes",
      "Al Manzala",
      "Aga",
      "Sherbin",
      "Belqas",
      "Tima",
      "Al Gamaliya",
      "Gamasa",
      "Mitt Ghamr",
      "El Kurdi",
    ],
  },
  {
    name: "Menoufia",
    cities: [
      "Shebin El KOm",
      "Tala",
      "Menouf",
      "Sers El Layan",
      "Al Shohada",
      "Quesna",
      "Al Bagour",
      "Birket El Sab",
      "El Sadat",
      "Al Dana",
    ],
  },
  {
    name: "Gharbia",
    cities: [
      "Tanta",
      "Al Mahalla El Kubra",
      "Kafr El Zayat",
      "Zefta",
      "Samanoud",
      "Basion",
      "Al GMT",
      "El Santa",
      "Qutour",
      "Al Rahmaniyah",
    ],
  },
  {
    name: "Kafr El Sheikh",
    cities: [
      "Kafr El Sheikh",
      "Desouk",
      "Bela",
      "Sidi Ghazi",
      "El Burullus",
      "Al Hamoul",
      "Al Riadh",
      "Baltim",
      "Metoubes",
      "Sakha",
    ],
  },
  {
    name: "Port Said",
    cities: [
      "Port Said",
      "Port Fuad",
      "Al Manakh",
      "Al Zohour",
      "Al Arab",
      "Al Nasr",
    ],
  },
  {
    name: "Suez",
    cities: [
      "Suez",
      "Ain Sokhna",
      "Al Ganah",
      "Al Suez",
      "Al Shoqayef",
      "Ramadan",
    ],
  },
  {
    name: "Ismailia",
    cities: [
      "Ismailia",
      "Al Qantara",
      "Al Tal El Kebir",
      "Fayed",
      "Sarabit El Khadim",
      "Al Nassereya",
      "New Ismailia",
    ],
  },
  {
    name: "Red Sea",
    cities: [
      "Hurghada",
      "Marsa Alam",
      "Sharm El Sheikh",
      "Dahab",
      "Safaga",
      "El Quseer",
      "Ras Ghareb",
      "Halaib",
      "Marsa Matrouh",
    ],
  },
  {
    name: "New Valley",
    cities: [
      "Kharga",
      "Dakhla",
      "Farafra",
      "Baris",
      "Mut",
      "El Wahat",
    ],
  },
  {
    name: "Beni Suef",
    cities: [
      "Beni Suef",
      "Al Wasta",
      "Biba",
      "Sedfa",
      "Al Minshad",
      "Ehnasia",
      "Al Fashn",
      "Al Badr",
      "Dayr Mawas",
      "Marsa Matrouh",
    ],
  },
  {
    name: "Minya",
    cities: [
      "Minya",
      "Maghagha",
      "Malawi",
      "Samalut",
      "Beni Mazar",
      "Mattay",
      "Deir Mawas",
      "Madinat El Fath",
      "Ain Shams",
      "Qasr Al Fath",
    ],
  },
  {
    name: "Assiut",
    cities: [
      "Assiut",
      "Sohag",
      "Al Balyana",
      "Abu Tig",
      "El Badari",
      "Al Khatatba",
      "Manfalut",
      "Dairut",
      "Al Ghanayim",
      "Sidfa",
    ],
  },
  {
    name: "Sohag",
    cities: [
      "Sohag",
      "Akhmim",
      "Girga",
      "Al Balyana",
      "Tahta",
      "Juhayna",
      "Al Maragha",
      "Sama",
      "Al Mansha",
      "Qasr",
    ],
  },
  {
    name: "Qena",
    cities: [
      "Qena",
      "Luxor",
      "Qus",
      "Naqada",
      "Farshut",
      "Dendera",
      "Al Waqf",
      "Al Mahamid",
      "Nekhel",
      "Sahel Selim",
    ],
  },
  {
    name: "Luxor",
    cities: [
      "Luxor",
      "Karnak",
      "Valley of the Kings",
      "Esna",
      "Edfu",
      "Kom Ombo",
      "Al Kharnak",
      "Al Bayadiya",
      "Al Mrah",
    ],
  },
  {
    name: "Aswan",
    cities: [
      "Aswan",
      "Abu Simbel",
      "Kom Ombo",
      "Edfu",
      "Philae",
      "Elephantine",
      "Syene",
      "Al Dabbah",
      "Nekhel",
      "Ras Al Him",
    ],
  },
  {
    name: "Matrouh",
    cities: [
      "Marsa Matrouh",
      "Alexandria",
      "El Alamein",
      "Sidi Barrani",
      "Mersa Matruh",
      "Al Hamam",
      "Dabaa",
      "Alamein",
      "Marina",
      "Zagazig",
    ],
  },
  {
    name: "North Sinai",
    cities: [
      "Arish",
      "Rafah",
      "Sheikh Zuweid",
      "Al Hasana",
      "Bir al-Abed",
      "Tal Al Sultan",
      "Al Mazar",
      "Al Nakhla",
      "Wadi Al Mukhtar",
    ],
  },
  {
    name: "South Sinai",
    cities: [
      "Sharm El Sheikh",
      "Dahab",
      "Nuweiba",
      "Taba",
      "Saint Catherine",
      "Ras Sudr",
      "Marsa Alam",
      "Soma Bay",
      "El Tor",
      "Abu Rudies",
    ],
  },
  {
    name: "6th of October",
    cities: [
      "6th of October City",
      "Sheikh Zayed",
      "Industrial Zone",
      "Central Business District",
      "Dreamland",
      "Grand Heights",
      "Family Village",
      "Al Motley",
    ],
  },
  {
    name: "Alamein",
    cities: [
      "Al Alamein City",
      "Marina",
      "North Coast",
      "El Dabaa",
      "Alamein Resort",
      "Sidi Abdallah",
      "Al Bahr",
      "Al Ghandour",
    ],
  },
];

async function main() {
  console.log("Starting database seeding...");

  try {
    console.log("\n--- Seeding Governments and Cities ---");

    for (const gov of egyptData) {
      // Check if government already exists
      const existingGov = await prisma.government.findFirst({
        where: { name: gov.name },
      });

      if (!existingGov) {
        const createdGov = await prisma.government.create({
          data: { name: gov.name },
        });
        console.log(`Created government: ${createdGov.name}`);

        // Create cities
        for (const cityName of gov.cities) {
          await prisma.city.create({
            data: {
              name: cityName,
              governmentId: createdGov.id,
            },
          });
          console.log(`  - Created city: ${cityName}`);
        }
      } else {
        console.log(`Government already exists: ${gov.name}`);
      }
    }

    // 3. Seed Test User
    console.log("\n--- Seeding Test User ---");

    // Check if test user already exists
    const existingTestUser = await prisma.user.findFirst({
      where: { phoneNumber: "+201001234567" },
    });

    if (!existingTestUser) {
      const testUser = await prisma.user.create({
        data: {
          phoneNumber: "+201001234567",
          firstName: "محمد",
          middleName: "أحمد",
          lastName: "علي",
          status: "ACTIVE",
          role: "USER",
        },
      });
      console.log(`Created test user: ${testUser.firstName} ${testUser.lastName}`);

      // Create client profile for test user
      await prisma.clientProfile.create({
        data: {
          userId: testUser.id,
          address: "القاهرة، شارع النيل",
          addressNotes: "الشقة 5، العمارة 10",
        },
      });
      console.log(`Created client profile for test user`);
    } else {
      console.log("Test user already exists");
    }

    // 4. Seed Test Workers (Craftsmen)
    console.log("\n--- Seeding Test Workers ---");

    // Get some specializations and governments for workers
    const cairo = await prisma.government.findFirst({ where: { name: "Cairo" } });
    const giza = await prisma.government.findFirst({ where: { name: "Giza" } });
    const carpentry = await prisma.specialization.findFirst({ where: { name: "Carpentry" } });
    const plumbing = await prisma.specialization.findFirst({ where: { name: "Plumbing" } });
    const electrical = await prisma.specialization.findFirst({ where: { name: "Electrical" } });

    const furnitureMaking = await prisma.subSpecialization.findFirst({
      where: { name: "Furniture Making", mainSpecializationId: carpentry?.id }
    });
    const waterPiping = await prisma.subSpecialization.findFirst({
      where: { name: "Water Piping", mainSpecializationId: plumbing?.id }
    });
    const wiring = await prisma.subSpecialization.findFirst({
      where: { name: "Wiring & Rewiring", mainSpecializationId: electrical?.id }
    });

    // Worker 1: Approved Carpenter
    const existingWorker1 = await prisma.user.findFirst({
      where: { phoneNumber: "+201111111111" },
    });

    if (!existingWorker1 && cairo && carpentry && furnitureMaking) {
      const worker1 = await prisma.user.create({
        data: {
          phoneNumber: "+201111111111",
          firstName: "أحمد",
          middleName: "محمود",
          lastName: "حسن",
          governmentId: cairo.id,
          status: "ACTIVE",
          role: "USER",
        },
      });

      const workerProfile1 = await prisma.workerProfile.create({
        data: {
          userId: worker1.id,
          experienceYears: 10,
          isInTeam: false,
          acceptsUrgentJobs: true,
          isApproved: true,
          rating: 4.8,
          servicePrice: 150.0,
          isAvailableNow: true,
          completedServices: 85,
          bio: "نجار محترف متخصص في صناعة الأثاث المنزلي والمكتبي بخبرة 10 سنوات",
        },
      });

      await prisma.chosenSpecialization.create({
        data: {
          workerProfileId: workerProfile1.id,
          subSpecializationId: furnitureMaking.id,
          specializationId: carpentry.id,
        },
      });

      await prisma.governmentForWorkers.create({
        data: {
          workerProfileId: workerProfile1.id,
          governmentId: cairo.id,
        },
      });

      console.log(`Created approved worker: ${worker1.firstName} ${worker1.lastName} (Carpenter)`);
    }

    // Worker 2: Approved Plumber
    const existingWorker2 = await prisma.user.findFirst({
      where: { phoneNumber: "+201222222222" },
    });

    if (!existingWorker2 && giza && plumbing && waterPiping) {
      const worker2 = await prisma.user.create({
        data: {
          phoneNumber: "+201222222222",
          firstName: "محمد",
          middleName: "علي",
          lastName: "عبدالله",
          governmentId: giza.id,
          status: "ACTIVE",
          role: "USER",
        },
      });

      const workerProfile2 = await prisma.workerProfile.create({
        data: {
          userId: worker2.id,
          experienceYears: 7,
          isInTeam: true,
          acceptsUrgentJobs: true,
          isApproved: true,
          rating: 4.5,
          servicePrice: 120.0,
          isAvailableNow: true,
          completedServices: 62,
          bio: "سباك خبرة في تمديد المواسير وإصلاح التسريبات",
        },
      });

      await prisma.chosenSpecialization.create({
        data: {
          workerProfileId: workerProfile2.id,
          subSpecializationId: waterPiping.id,
          specializationId: plumbing.id,
        },
      });

      await prisma.governmentForWorkers.create({
        data: {
          workerProfileId: workerProfile2.id,
          governmentId: giza.id,
        },
      });

      console.log(`Created approved worker: ${worker2.firstName} ${worker2.lastName} (Plumber)`);
    }

    // Worker 3: Approved Electrician (accepts urgent jobs)
    const existingWorker3 = await prisma.user.findFirst({
      where: { phoneNumber: "+201333333333" },
    });

    if (!existingWorker3 && cairo && electrical && wiring) {
      const worker3 = await prisma.user.create({
        data: {
          phoneNumber: "+201333333333",
          firstName: "خالد",
          middleName: "حسين",
          lastName: "إبراهيم",
          governmentId: cairo.id,
          status: "ACTIVE",
          role: "USER",
        },
      });

      const workerProfile3 = await prisma.workerProfile.create({
        data: {
          userId: worker3.id,
          experienceYears: 12,
          isInTeam: false,
          acceptsUrgentJobs: true,
          isApproved: true,
          rating: 4.9,
          servicePrice: 180.0,
          isAvailableNow: true,
          completedServices: 120,
          bio: "كهربائي محترف متخصص في الأعمال الكهربائية السكنية والتجارية",
        },
      });

      await prisma.chosenSpecialization.create({
        data: {
          workerProfileId: workerProfile3.id,
          subSpecializationId: wiring.id,
          specializationId: electrical.id,
        },
      });

      await prisma.governmentForWorkers.create({
        data: {
          workerProfileId: workerProfile3.id,
          governmentId: cairo.id,
        },
      });

      console.log(`Created approved worker: ${worker3.firstName} ${worker3.lastName} (Electrician)`);
    }

    // Worker 4: Pending approval (for testing filters)
    const existingWorker4 = await prisma.user.findFirst({
      where: { phoneNumber: "+201444444444" },
    });

    if (!existingWorker4 && cairo && carpentry && furnitureMaking) {
      const worker4 = await prisma.user.create({
        data: {
          phoneNumber: "+201444444444",
          firstName: "يوسف",
          middleName: "سعيد",
          lastName: "محمد",
          governmentId: cairo.id,
          status: "ACTIVE",
          role: "USER",
        },
      });

      await prisma.workerProfile.create({
        data: {
          userId: worker4.id,
          experienceYears: 3,
          isInTeam: false,
          acceptsUrgentJobs: false,
          isApproved: false, // Not approved yet
          rating: 0,
          servicePrice: 100.0,
          isAvailableNow: true,
          completedServices: 0,
          bio: "نجار جديد يبحث عن فرص عمل",
        },
      });

      console.log(`Created pending worker: ${worker4.firstName} ${worker4.lastName} (Not Approved)`);
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
