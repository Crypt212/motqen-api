import 'dotenv/config';
import prisma from '../../src/libs/database.js';

// Craftsman Specializations Data
const specializations = [
  {
    name: 'Carpentry',
    nameAr: 'النجارة',
    category: 'CARPENTRY',
    subSpecializations: [
      { name: 'Furniture Making', nameAr: 'صنع الأثاث' },
      { name: 'Wood Carving', nameAr: 'نقش الخشب' },
      { name: 'Cabinet Making', nameAr: 'صنع الخزائن' },
      { name: 'Door & Window Installation', nameAr: 'تركيب الأبواب والنوافذ' },
      { name: 'Kitchen Cabinets', nameAr: 'خزائن المطبخ' },
    ],
  },
  {
    name: 'Plumbing',
    nameAr: 'السباكة',
    category: 'PLUMBING',
    subSpecializations: [
      { name: 'Water Piping', nameAr: 'تمديدات المياه' },
      { name: 'Drainage Systems', nameAr: 'أنظمة الصرف' },
      { name: 'Water Heater Installation', nameAr: 'تركيب سخانات المياه' },
      { name: 'Bathroom Fixtures', nameAr: 'تجهيزات الحمامات' },
      { name: 'Pipe Leak Repair', nameAr: 'إصلاح تسريبات الأنابيب' },
    ],
  },
  {
    name: 'Electrical',
    nameAr: 'الكهرباء',
    category: 'ELECTRICITY',
    subSpecializations: [
      { name: 'Wiring & Rewiring', nameAr: 'تمديد وأسلاك الكهرباء' },
      { name: 'Switchboard Installation', nameAr: 'تركيب لوحات الكهرباء' },
      { name: 'Lighting Installation', nameAr: 'تركيب الإضاءة' },
      { name: 'AC Installation', nameAr: 'تركيب التكييف' },
      { name: 'Generator Installation', nameAr: 'تركيب المولدات' },
    ],
  },
  {
    name: 'Painting',
    nameAr: 'الدهان',
    category: 'PAINTING',
    subSpecializations: [
      { name: 'Interior Painting', nameAr: 'دهان داخلي' },
      { name: 'Exterior Painting', nameAr: 'دهان خارجي' },
      { name: 'Wall Textures', nameAr: 'دهان الجدران بالملمس' },
      { name: 'Decorative Painting', nameAr: 'الدهان الزخرفي' },
      { name: 'Waterproofing', nameAr: 'العزل المائي' },
    ],
  },
  {
    name: 'Tiling',
    nameAr: 'البلاط',
    category: 'CONSTRUCTION',
    subSpecializations: [
      { name: 'Floor Tiling', nameAr: 'تركيب بلاط الأرضيات' },
      { name: 'Wall Tiling', nameAr: 'تركيب بلاط الجدران' },
      { name: 'Mosaic Work', nameAr: 'أعمال الفسيفساء' },
      { name: 'Marble Installation', nameAr: 'تركيب الرخام' },
      { name: 'Grouting & Sealing', nameAr: 'السلستير والعزل' },
    ],
  },
  {
    name: 'Masonry',
    nameAr: 'البناء',
    category: 'CONSTRUCTION',
    subSpecializations: [
      { name: 'Bricklaying', nameAr: 'البناء بالطوب' },
      { name: 'Block Work', nameAr: 'البناء بالبلوك' },
      { name: 'Stone Masonry', nameAr: 'البناء بالحجر' },
      { name: 'Concrete Work', nameAr: 'الأعمال الخرسانية' },
      { name: 'Wall Repair', nameAr: 'إصلاح الجدران' },
    ],
  },
  {
    name: 'Aluminum',
    nameAr: 'الألمنيوم',
    category: 'INSTALLATION',
    subSpecializations: [
      { name: 'Window Frames', nameAr: 'إطارات النوافذ' },
      { name: 'Door Frames', nameAr: 'إطارات الأبواب' },
      { name: 'Glass Work', nameAr: 'أعمال الزجاج' },
      { name: 'Curtain Walls', nameAr: 'الجدران الستارية' },
      { name: 'Partition Walls', nameAr: 'الجدران الفاصلة' },
    ],
  },
  {
    name: 'Welding',
    nameAr: 'اللحام',
    category: 'GENERALMAINTENANCE',
    subSpecializations: [
      { name: 'Iron Work', nameAr: 'أعمال الحديد' },
      { name: 'Steel Structures', nameAr: 'الهياكل الفولاذية' },
      { name: 'Gate & Fence', nameAr: 'البوابات والأسوار' },
      { name: 'Metal Furniture', nameAr: 'الأثاث المعدني' },
      { name: 'Pipe Welding', nameAr: 'لحام الأنابيب' },
    ],
  },
  {
    name: 'HVAC',
    nameAr: 'التكييف والتبريد',
    category: 'AC',
    subSpecializations: [
      { name: 'AC Installation', nameAr: 'تركيب التكييف' },
      { name: 'AC Repair', nameAr: 'إصلاح التكييف' },
      { name: 'Ventilation Systems', nameAr: 'أنظمة التهوية' },
      { name: 'Central Heating', nameAr: 'التدفئة المركزية' },
      { name: 'Refrigeration', nameAr: 'التبريد' },
    ],
  },
  {
    name: 'Flooring',
    nameAr: 'الأرضيات',
    category: 'INSTALLATION',
    subSpecializations: [
      { name: 'Wood Flooring', nameAr: 'أرضيات خشبية' },
      { name: 'Laminate Flooring', nameAr: 'أرضيات ملامين' },
      { name: 'Vinyl Flooring', nameAr: 'أرضيات فينيل' },
      { name: 'Carpet Installation', nameAr: 'تركيب السجاد' },
      { name: 'Parquet', nameAr: 'الباركيه' },
    ],
  },
];

async function main() {
  console.log('Starting database seeding...');

  try {
    console.log('\n--- Seeding Specializations and Sub-specializations ---');

    for (const spec of specializations) {
      // Check if specialization already exists
      const existingSpec = await prisma.specialization.findFirst({
        where: { name: spec.name },
      });

      if (!existingSpec) {
        const createdSpec = await prisma.specialization.create({
          data: {
            name: spec.name,
            nameAr: spec.nameAr,
            category: spec.category,
          },
        });
        console.log(`Created specialization: ${createdSpec.name}`);

        // Create sub-specializations
        for (const subSpec of spec.subSpecializations) {
          await prisma.subSpecialization.create({
            data: {
              name: subSpec.name,
              nameAr: subSpec.nameAr,
              mainSpecializationId: createdSpec.id,
            },
          });
          console.log(`  - Created sub-specialization: ${subSpec.name}`);
        }
      } else {
        console.log(`Specialization already exists: ${spec.name}`);
      }
    }

    console.log('\n--- Database seeding completed successfully! ---');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
