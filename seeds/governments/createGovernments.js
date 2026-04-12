import prisma from '../../src/libs/database.js';

// Egyptian Governments and their Cities
// We'll track the first government and first city for creating a location for the test client
let firstGovId = null;
let firstCityId = null;

const egyptData = [
  {
    name: 'Cairo',
    nameAr: 'القاهرة',
    long: '31.2357',
    lat: '30.0444',
    cities: [
      { name: 'Maadi', nameAr: 'المعادي', long: '31.2571', lat: '29.9592' },
      { name: 'Helwan', nameAr: 'حلوان', long: '31.3328', lat: '29.8423' },
      {
        name: 'New Cairo',
        nameAr: 'القاهرة الجديدة',
        long: '31.4617',
        lat: '30.0131',
      },
      { name: 'El Shorouk', nameAr: 'الشروق', long: '31.3644', lat: '30.3075' },
      { name: 'Madinaty', nameAr: 'مدينتي', long: '31.4543', lat: '30.0825' },
      { name: 'Badr', nameAr: 'بدر', long: '31.4833', lat: '30.1167' },
      {
        name: 'Shubra El Kheima',
        nameAr: 'شبرا الخيمة',
        long: '31.2436',
        lat: '30.1291',
      },
      { name: 'El Marg', nameAr: 'المرج', long: '31.3203', lat: '30.1781' },
      {
        name: 'El Matareya',
        nameAr: 'المطرية',
        long: '31.3608',
        lat: '30.1903',
      },
      { name: 'El Salam', nameAr: 'السلام', long: '31.2864', lat: '30.2142' },
      {
        name: 'Manshiyat Naser',
        nameAr: 'منشية ناصر',
        long: '31.2750',
        lat: '30.0756',
      },
      {
        name: 'Rod El Farag',
        nameAr: 'روض الفرج',
        long: '31.2575',
        lat: '30.0861',
      },
      {
        name: 'El Zawiyah',
        nameAr: 'الزاوية',
        long: '31.3250',
        lat: '30.2167',
      },
      {
        name: 'Al-Moqattam',
        nameAr: 'المقطم',
        long: '31.2833',
        lat: '29.9833',
      },
      {
        name: 'Al-Khalifa',
        nameAr: 'الخليفة',
        long: '31.2167',
        lat: '30.0500',
      },
      {
        name: 'Al-Darb Al-Ahmar',
        nameAr: 'الدرب الأحمر',
        long: '31.2500',
        lat: '30.0333',
      },
      {
        name: 'Al-Masjid Al-Nabawi',
        nameAr: 'المسجد النبوي',
        long: '31.2667',
        lat: '30.0667',
      },
      {
        name: 'Al-Manshiyah',
        nameAr: 'المنشية',
        long: '31.2333',
        lat: '30.0333',
      },
      {
        name: 'Al-Azbakeyah',
        nameAr: 'الأزبكية',
        long: '31.2500',
        lat: '30.0333',
      },
      { name: 'Al-Waily', nameAr: 'الوايلي', long: '31.2500', lat: '30.0833' },
      {
        name: 'Al-Muhandisin',
        nameAr: 'المهندسين',
        long: '31.2000',
        lat: '30.0667',
      },
      { name: 'Al-Mokatam', nameAr: 'المقطم', long: '31.2833', lat: '29.9833' },
      {
        name: 'Al-Mokattam',
        nameAr: 'المقطم',
        long: '31.2833',
        lat: '29.9833',
      },
      { name: 'Al-Nozha', nameAr: 'النزهة', long: '31.3333', lat: '30.1500' },
      {
        name: 'Al-Mansoura',
        nameAr: 'المنصورة',
        long: '31.3500',
        lat: '30.1167',
      },
      {
        name: 'Al-Mahkama',
        nameAr: 'المحكمة',
        long: '31.2500',
        lat: '30.0500',
      },
    ],
  },
  {
    name: 'Alexandria',
    nameAr: 'الإسكندرية',
    long: '29.9311',
    lat: '31.2001',
    cities: [
      { name: 'Montaza', nameAr: 'المنتزه', long: '29.8833', lat: '31.2833' },
      { name: 'Maamoura', nameAr: 'معمورة', long: '30.0500', lat: '31.2500' },
      { name: 'Alamein', nameAr: 'العلمين', long: '28.9500', lat: '30.8333' },
      {
        name: 'Kafr El Sheikh',
        nameAr: 'كفر الشيخ',
        long: '30.9500',
        lat: '31.5167',
      },
      { name: 'Dekhela', nameAr: 'الدخيلة', long: '29.8333', lat: '31.1167' },
      {
        name: 'El Mahalla El Kubra',
        nameAr: 'المحلة الكبرى',
        long: '31.1667',
        lat: '30.9667',
      },
      {
        name: 'Borg El Arab',
        nameAr: 'برج العرب',
        long: '29.6833',
        lat: '30.9000',
      },
      { name: 'Marina', nameAr: 'مارينا', long: '28.9833', lat: '31.4500' },
    ],
  },
  {
    name: 'Giza',
    nameAr: 'الجيزة',
    long: '31.2124',
    lat: '30.0131',
    cities: [
      {
        name: '6th of October',
        nameAr: 'السادس من أكتوبر',
        long: '30.9725',
        lat: '29.9383',
      },
      {
        name: 'Sheikh Zayed',
        nameAr: 'الشيخ زايد',
        long: '30.9889',
        lat: '30.0092',
      },
      { name: 'Dokki', nameAr: 'الدقي', long: '31.2108', lat: '30.0394' },
      {
        name: 'Mohandessin',
        nameAr: 'المهندسين',
        long: '31.2086',
        lat: '30.0528',
      },
      { name: 'Agouza', nameAr: 'العجوزة', long: '31.2019', lat: '30.0561' },
      { name: 'Elharam', nameAr: 'الهرم', long: '31.1778', lat: '30.0219' },
      { name: 'Imbaba', nameAr: 'إمبابة', long: '31.1861', lat: '30.0783' },
      { name: 'Bulaq', nameAr: 'بولاق', long: '31.2531', lat: '30.0528' },
      { name: 'Kerdasa', nameAr: 'كرداسة', long: '31.1167', lat: '30.0333' },
      {
        name: 'Al-Moqattam',
        nameAr: 'المقطم',
        long: '31.2833',
        lat: '29.9833',
      },
      { name: 'Al-Haram', nameAr: 'الهرم', long: '31.1778', lat: '30.0219' },
      {
        name: 'Al-Mansoura',
        nameAr: 'المنصورة',
        long: '31.3500',
        lat: '30.1167',
      },
    ],
  },
  {
    name: 'Qalyubia',
    nameAr: 'القليوبية',
    long: '31.2167',
    lat: '30.3333',
    cities: [
      { name: 'Banha', nameAr: 'بنها', long: '31.1833', lat: '30.4667' },
      { name: 'Qalyub', nameAr: 'قليوب', long: '31.1833', lat: '30.3167' },
      {
        name: 'Shubra El Kheima',
        nameAr: 'شبرا الخيمة',
        long: '31.2436',
        lat: '30.1291',
      },
      {
        name: 'Al Qanater',
        nameAr: 'القناطر',
        long: '31.1667',
        lat: '30.1833',
      },
      { name: 'Khanka', nameAr: 'شنتنا', long: '31.2833', lat: '30.2833' },
      {
        name: 'Kafr Shukr',
        nameAr: 'كفر شكر',
        long: '31.1167',
        lat: '30.3000',
      },
      { name: 'Tiba', nameAr: 'طنبا', long: '31.0500', lat: '30.3500' },
      { name: 'Sinsin', nameAr: 'سينسن', long: '31.0833', lat: '30.4167' },
      { name: 'Al-Masjid', nameAr: 'المسجد', long: '31.2000', lat: '30.3500' },
      {
        name: 'Sheikh Hammad',
        nameAr: 'الشيخ حامد',
        long: '31.1500',
        lat: '30.3833',
      },
    ],
  },
  {
    name: 'Sharqia',
    nameAr: 'الشرقية',
    long: '31.6667',
    lat: '30.7333',
    cities: [
      { name: 'Zagazig', nameAr: 'الزقازيق', long: '31.5000', lat: '30.5833' },
      { name: 'Belbes', nameAr: 'بلبيس', long: '31.7500', lat: '30.4167' },
      {
        name: 'Al Husseiniya',
        nameAr: 'الحسينية',
        long: '31.5500',
        lat: '30.2833',
      },
      { name: 'Faqous', nameAr: 'فاقوس', long: '31.8333', lat: '30.7333' },
      { name: 'Hihya', nameAr: 'ههيا', long: '31.6833', lat: '30.6667' },
      {
        name: 'Al Ibrahimiya',
        nameAr: 'الإبراهيمية',
        long: '31.5667',
        lat: '30.5500',
      },
      {
        name: 'Minya Al Qamh',
        nameAr: 'منيا القمح',
        long: '31.4167',
        lat: '30.5167',
      },
      {
        name: 'Abu Kabir',
        nameAr: 'أبو كبير',
        long: '31.6833',
        lat: '30.7167',
      },
      { name: 'Salam', nameAr: 'سلام', long: '31.5833', lat: '30.6333' },
      { name: 'Kafr Saqr', nameAr: 'كفر صقر', long: '31.3333', lat: '30.6333' },
      {
        name: 'Deir Balah',
        nameAr: 'دير بلال',
        long: '31.7167',
        lat: '30.8000',
      },
      {
        name: 'Mashtoul El Souq',
        nameAr: 'مشتول السوق',
        long: '31.4500',
        lat: '30.5500',
      },
      { name: 'Qareen', nameAr: 'قرين', long: '31.5500', lat: '30.5000' },
      { name: 'Al Anwar', nameAr: 'الأنوار', long: '31.6000', lat: '30.6000' },
    ],
  },
  {
    name: 'Dakahlia',
    nameAr: 'الدقهلية',
    long: '31.5833',
    lat: '30.9333',
    cities: [
      { name: 'Mansoura', nameAr: 'المنصورة', long: '31.5000', lat: '30.8333' },
      { name: 'Talkha', nameAr: 'طلخا', long: '31.5833', lat: '30.9833' },
      { name: 'Nabaroh', nameAr: 'نبروه', long: '31.7167', lat: '31.0333' },
      { name: 'Dekernes', nameAr: 'دكرنس', long: '31.3333', lat: '30.9167' },
      {
        name: 'Al Manzala',
        nameAr: 'المنزلة',
        long: '31.6667',
        lat: '31.1500',
      },
      { name: 'Aga', nameAr: 'أجا', long: '31.2833', lat: '30.8833' },
      { name: 'Sherbin', nameAr: 'شربين', long: '31.4333', lat: '31.0000' },
      { name: 'Belqas', nameAr: 'بلقس', long: '31.2500', lat: '30.9500' },
      { name: 'Tima', nameAr: 'تمي', long: '31.3667', lat: '30.8333' },
      {
        name: 'Al Gamaliya',
        nameAr: 'الجمالية',
        long: '31.5667',
        lat: '30.8000',
      },
      { name: 'Gamasa', nameAr: 'جمصة', long: '31.2167', lat: '31.0167' },
      { name: 'Mitt Ghamr', nameAr: 'مطوبس', long: '31.2667', lat: '30.7500' },
      { name: 'El Kurdi', nameAr: 'الكريدي', long: '31.4500', lat: '30.8500' },
    ],
  },
  {
    name: 'Menoufia',
    nameAr: 'المنوفية',
    long: '31.0000',
    lat: '30.5667',
    cities: [
      {
        name: 'Shebin El KOm',
        nameAr: 'شبين الكوم',
        long: '31.0000',
        lat: '30.5333',
      },
      { name: 'Tala', nameAr: 'تلا', long: '30.9333', lat: '30.6167' },
      { name: 'Menouf', nameAr: 'منوف', long: '30.9500', lat: '30.4667' },
      {
        name: 'Sers El Layan',
        nameAr: 'سرس الليان',
        long: '31.0833',
        lat: '30.5833',
      },
      {
        name: 'Al Shohada',
        nameAr: 'الشهادات',
        long: '30.8833',
        lat: '30.5667',
      },
      { name: 'Quesna', nameAr: 'قويسنا', long: '31.0833', lat: '30.4833' },
      { name: 'Al Bagour', nameAr: 'الباجور', long: '31.1500', lat: '30.4500' },
      {
        name: 'Birket El Sab',
        nameAr: 'بركة السبع',
        long: '30.8000',
        lat: '30.5500',
      },
      { name: 'El Sadat', nameAr: 'السادات', long: '30.8500', lat: '30.3667' },
      { name: 'Al Dana', nameAr: 'الدنا', long: '30.9500', lat: '30.5000' },
    ],
  },
  {
    name: 'Gharbia',
    nameAr: 'الغربية',
    long: '31.0833',
    lat: '30.8333',
    cities: [
      { name: 'Tanta', nameAr: 'طنطا', long: '31.0000', lat: '30.7833' },
      {
        name: 'Al Mahalla El Kubra',
        nameAr: 'المحلة الكبرى',
        long: '31.1667',
        lat: '30.9667',
      },
      {
        name: 'Kafr El Zayat',
        nameAr: 'كفر الزيات',
        long: '30.8333',
        lat: '30.8167',
      },
      { name: 'Zefta', nameAr: 'زفتى', long: '31.0833', lat: '30.7333' },
      { name: 'Samanoud', nameAr: 'سمنود', long: '30.9667', lat: '30.9500' },
      { name: 'Basion', nameAr: 'بسيون', long: '31.2167', lat: '30.7167' },
      { name: 'Al GMT', nameAr: 'جرجا', long: '31.0833', lat: '30.8667' },
      { name: 'El Santa', nameAr: 'السنطة', long: '31.1500', lat: '30.8333' },
      { name: 'Qutour', nameAr: 'قطور', long: '31.2500', lat: '30.8000' },
      {
        name: 'Al Rahmaniyah',
        nameAr: 'الرحمنية',
        long: '30.9000',
        lat: '30.8500',
      },
    ],
  },
  {
    name: 'Kafr El Sheikh',
    nameAr: 'كفر الشيخ',
    long: '30.9500',
    lat: '31.5167',
    cities: [
      {
        name: 'Kafr El Sheikh',
        nameAr: 'كفر الشيخ',
        long: '30.9500',
        lat: '31.5167',
      },
      { name: 'Desouk', nameAr: 'دسوق', long: '30.6500', lat: '31.4500' },
      { name: 'Bela', nameAr: 'بلEla', long: '30.8500', lat: '31.3333' },
      {
        name: 'Sidi Ghazi',
        nameAr: 'سيدي غازي',
        long: '30.7500',
        lat: '31.5500',
      },
      {
        name: 'El Burullus',
        nameAr: 'البرلس',
        long: '30.5500',
        lat: '31.6500',
      },
      { name: 'Al Hamoul', nameAr: 'الحمول', long: '30.8000', lat: '31.6000' },
      { name: 'Al Riadh', nameAr: 'الرياض', long: '30.7000', lat: '31.5000' },
      { name: 'Baltim', nameAr: 'بلطيم', long: '30.4500', lat: '31.5833' },
      { name: 'Metoubes', nameAr: 'متوبا', long: '30.5500', lat: '31.4167' },
      { name: 'Sakha', nameAr: 'سخا', long: '30.9000', lat: '31.5500' },
    ],
  },
  {
    name: 'Port Said',
    nameAr: 'بورسعيد',
    long: '32.3000',
    lat: '31.2500',
    cities: [
      { name: 'Port Said', nameAr: 'بورسعيد', long: '32.3000', lat: '31.2500' },
      { name: 'Port Fuad', nameAr: 'بورفؤاد', long: '32.3167', lat: '31.2833' },
      { name: 'Al Manakh', nameAr: 'المناخ', long: '32.2833', lat: '31.2667' },
      { name: 'Al Zohour', nameAr: 'الزهور', long: '32.2667', lat: '31.2333' },
      { name: 'Al Arab', nameAr: 'العرب', long: '32.3500', lat: '31.2833' },
      { name: 'Al Nasr', nameAr: 'النصر', long: '32.3000', lat: '31.2167' },
    ],
  },
  {
    name: 'Suez',
    nameAr: 'السويس',
    long: '32.5500',
    lat: '30.0167',
    cities: [
      { name: 'Suez', nameAr: 'السويس', long: '32.5500', lat: '30.0167' },
      {
        name: 'Ain Sokhna',
        nameAr: 'عين السخنة',
        long: '32.3167',
        lat: '29.9000',
      },
      { name: 'Al Ganah', nameAr: 'الجنينة', long: '32.6000', lat: '30.0333' },
      { name: 'Al Suez', nameAr: 'السويس', long: '32.5500', lat: '30.0167' },
      {
        name: 'Al Shoqayef',
        nameAr: 'الشقاوي',
        long: '32.5833',
        lat: '30.0500',
      },
      { name: 'Ramadan', nameAr: 'رمضان', long: '32.2833', lat: '30.1167' },
    ],
  },
  {
    name: 'Ismailia',
    nameAr: 'الإسماعيلية',
    long: '32.2667',
    lat: '30.4000',
    cities: [
      {
        name: 'Ismailia',
        nameAr: 'الإسماعيلية',
        long: '32.2667',
        lat: '30.4000',
      },
      {
        name: 'Al Qantara',
        nameAr: 'القنطرة',
        long: '32.3500',
        lat: '30.8500',
      },
      {
        name: 'Al Tal El Kebir',
        nameAr: 'التل الكبير',
        long: '32.1167',
        lat: '30.3167',
      },
      { name: 'Fayed', nameAr: 'فايد', long: '32.2000', lat: '30.3500' },
      {
        name: 'Sarabit El Khadim',
        nameAr: 'سرابت الخادم',
        long: '32.4000',
        lat: '30.6000',
      },
      {
        name: 'Al Nassereya',
        nameAr: 'الناصرية',
        long: '32.1833',
        lat: '30.4167',
      },
      {
        name: 'New Ismailia',
        nameAr: 'الإسماعيلية الجديدة',
        long: '32.2833',
        lat: '30.3833',
      },
    ],
  },
  {
    name: 'Red Sea',
    nameAr: 'البحر الأحمر',
    long: '33.8333',
    lat: '25.0000',
    cities: [
      { name: 'Hurghada', nameAr: 'الغردقة', long: '33.8117', lat: '27.2576' },
      {
        name: 'Marsa Alam',
        nameAr: 'مرسى علم',
        long: '34.8833',
        lat: '25.0667',
      },
      {
        name: 'Sharm El Sheikh',
        nameAr: 'شرم الشيخ',
        long: '34.3615',
        lat: '27.9104',
      },
      { name: 'Dahab', nameAr: 'دهب', long: '34.4833', lat: '28.4833' },
      { name: 'Safaga', nameAr: 'سفاجا', long: '33.7500', lat: '26.7833' },
      { name: 'El Quseer', nameAr: 'القصير', long: '33.6333', lat: '26.1167' },
      {
        name: 'Ras Ghareb',
        nameAr: 'راس غارب',
        long: '33.0667',
        lat: '27.4333',
      },
      { name: 'Halaib', nameAr: 'حلايب', long: '36.2833', lat: '22.2000' },
      {
        name: 'Marsa Matrouh',
        nameAr: 'مرسى مطروح',
        long: '25.0667',
        lat: '31.3500',
      },
    ],
  },
  {
    name: 'New Valley',
    nameAr: 'الوادي الجديد',
    long: '25.0000',
    lat: '25.0000',
    cities: [
      { name: 'Kharga', nameAr: 'الخارجة', long: '30.8000', lat: '25.7833' },
      { name: 'Dakhla', nameAr: 'الداخلة', long: '30.5833', lat: '25.5000' },
      { name: 'Farafra', nameAr: 'الفرافرة', long: '28.9667', lat: '27.0667' },
      { name: 'Baris', nameAr: 'باريس', long: '30.4167', lat: '24.6333' },
      { name: 'Mut', nameAr: 'موط', long: '30.1667', lat: '25.5667' },
      { name: 'El Wahat', nameAr: 'الواحات', long: '28.5000', lat: '26.0000' },
    ],
  },
  {
    name: 'Beni Suef',
    nameAr: 'بني سويف',
    long: '31.1000',
    lat: '29.0667',
    cities: [
      {
        name: 'Beni Suef',
        nameAr: 'بني سويف',
        long: '31.1000',
        lat: '29.0667',
      },
      { name: 'Al Wasta', nameAr: 'الواسطي', long: '31.2833', lat: '29.1333' },
      { name: 'Biba', nameAr: 'بيبا', long: '31.0167', lat: '28.8500' },
      { name: 'Sedfa', nameAr: 'صدفا', long: '31.2000', lat: '28.9500' },
      {
        name: 'Al Minshad',
        nameAr: 'المنشأة',
        long: '31.0667',
        lat: '29.0000',
      },
      { name: 'Ehnasia', nameAr: 'إهنسيا', long: '31.1667', lat: '29.1833' },
      { name: 'Al Fashn', nameAr: 'الفشن', long: '31.0333', lat: '28.7500' },
      { name: 'Al Badr', nameAr: 'البدري', long: '31.2167', lat: '29.1000' },
      {
        name: 'Dayr Mawas',
        nameAr: 'دير ماؤها',
        long: '30.9333',
        lat: '29.1500',
      },
      {
        name: 'Marsa Matrouh',
        nameAr: 'مرسى مطروح',
        long: '25.0667',
        lat: '31.3500',
      },
    ],
  },
  {
    name: 'Minya',
    nameAr: 'المنيا',
    long: '30.7500',
    lat: '28.1667',
    cities: [
      { name: 'Minya', nameAr: 'المنيا', long: '30.7500', lat: '28.1667' },
      { name: 'Maghagha', nameAr: 'مغاغة', long: '30.4500', lat: '28.3333' },
      { name: 'Malawi', nameAr: 'ملاوي', long: '30.5500', lat: '28.4167' },
      { name: 'Samalut', nameAr: 'سمالوط', long: '30.8333', lat: '28.1000' },
      {
        name: 'Beni Mazar',
        nameAr: 'بني مزار',
        long: '30.6333',
        lat: '28.5000',
      },
      { name: 'Mattay', nameAr: 'متي', long: '30.7000', lat: '28.0500' },
      {
        name: 'Deir Mawas',
        nameAr: 'دير ماؤها',
        long: '30.9333',
        lat: '29.1500',
      },
      {
        name: 'Madinat El Fath',
        nameAr: 'مدينة الفتح',
        long: '30.8167',
        lat: '28.2500',
      },
      { name: 'Ain Shams', nameAr: 'عين شمس', long: '30.7833', lat: '28.2000' },
      {
        name: 'Qasr Al Fath',
        nameAr: 'قصر الفتح',
        long: '30.8500',
        lat: '28.1833',
      },
    ],
  },
  {
    name: 'Assiut',
    nameAr: 'أسيوط',
    long: '31.1667',
    lat: '27.1833',
    cities: [
      { name: 'Assiut', nameAr: 'أسيوط', long: '31.1667', lat: '27.1833' },
      { name: 'Sohag', nameAr: 'سوهاج', long: '31.7000', lat: '26.5667' },
      {
        name: 'Al Balyana',
        nameAr: 'البلينا',
        long: '31.7667',
        lat: '26.2000',
      },
      { name: 'Abu Tig', nameAr: 'أبو تيج', long: '31.3333', lat: '27.0500' },
      {
        name: 'El Badari',
        nameAr: 'البدراني',
        long: '31.4333',
        lat: '26.9500',
      },
      {
        name: 'Al Khatatba',
        nameAr: 'الخطيبية',
        long: '31.2500',
        lat: '27.3000',
      },
      { name: 'Manfalut', nameAr: 'منفلوط', long: '31.1167', lat: '27.3000' },
      { name: 'Dairut', nameAr: 'ديروط', long: '31.2833', lat: '27.4333' },
      {
        name: 'Al Ghanayim',
        nameAr: 'الغنايم',
        long: '31.2000',
        lat: '27.0833',
      },
      { name: 'Sidfa', nameAr: 'سدة', long: '31.3500', lat: '26.8167' },
    ],
  },
  {
    name: 'Sohag',
    nameAr: 'سوهاج',
    long: '31.7000',
    lat: '26.5667',
    cities: [
      { name: 'Sohag', nameAr: 'سوهاج', long: '31.7000', lat: '26.5667' },
      { name: 'Akhmim', nameAr: 'أخميم', long: '31.7500', lat: '26.3167' },
      { name: 'Girga', nameAr: 'جرجا', long: '31.0833', lat: '30.8667' },
      {
        name: 'Al Balyana',
        nameAr: 'البلينا',
        long: '31.7667',
        lat: '26.2000',
      },
      { name: 'Tahta', nameAr: 'طهطا', long: '31.5667', lat: '26.3833' },
      { name: 'Juhayna', nameAr: 'جهينة', long: '31.8500', lat: '26.5667' },
      {
        name: 'Al Maragha',
        nameAr: 'المراغة',
        long: '31.6833',
        lat: '26.4500',
      },
      { name: 'Sama', nameAr: 'سما', long: '31.7167', lat: '26.3000' },
      { name: 'Al Mansha', nameAr: 'المنشأة', long: '31.6333', lat: '26.5500' },
      { name: 'Qasr', nameAr: 'قصر', long: '31.7833', lat: '26.1833' },
    ],
  },
  {
    name: 'Qena',
    nameAr: 'قنا',
    long: '32.7333',
    lat: '26.1667',
    cities: [
      { name: 'Qena', nameAr: 'قنا', long: '32.7333', lat: '26.1667' },
      { name: 'Luxor', nameAr: 'الأقصر', long: '32.6396', lat: '25.6872' },
      { name: 'Qus', nameAr: 'قوص', long: '32.8167', lat: '25.9667' },
      { name: 'Naqada', nameAr: 'نقادة', long: '32.6833', lat: '25.6833' },
      { name: 'Farshut', nameAr: 'فرشوط', long: '32.5667', lat: '25.8167' },
      { name: 'Dendera', nameAr: 'دندرة', long: '32.6500', lat: '25.2833' },
      { name: 'Al Waqf', nameAr: 'الوقف', long: '32.8000', lat: '26.1000' },
      {
        name: 'Al Mahamid',
        nameAr: 'المحاميد',
        long: '32.8500',
        lat: '26.0667',
      },
      { name: 'Nekhel', nameAr: 'نخل', long: '33.0500', lat: '26.2833' },
      {
        name: 'Sahel Selim',
        nameAr: 'ساحل سليم',
        long: '32.4833',
        lat: '26.1333',
      },
    ],
  },
  {
    name: 'Luxor',
    nameAr: 'الأقصر',
    long: '32.6396',
    lat: '25.6872',
    cities: [
      { name: 'Luxor', nameAr: 'الأقصر', long: '32.6396', lat: '25.6872' },
      { name: 'Karnak', nameAr: ' الكرنك', long: '32.6500', lat: '25.7333' },
      {
        name: 'Valley of the Kings',
        nameAr: 'وادي الملوك',
        long: '32.6000',
        lat: '25.7500',
      },
      { name: 'Esna', nameAr: 'إسنا', long: '32.5500', lat: '25.2833' },
      { name: 'Edfu', nameAr: 'إدفو', long: '32.8833', lat: '24.9667' },
      { name: 'Kom Ombo', nameAr: 'كوم أمبو', long: '32.9500', lat: '24.4333' },
      {
        name: 'Al Kharnak',
        nameAr: 'الخيرناق',
        long: '32.6333',
        lat: '25.7167',
      },
      {
        name: 'Al Bayadiya',
        nameAr: 'البياضية',
        long: '32.5833',
        lat: '25.6667',
      },
      { name: 'Al Mrah', nameAr: 'المراق', long: '32.7000', lat: '25.5500' },
    ],
  },
  {
    name: 'Aswan',
    nameAr: 'أسوان',
    long: '32.9000',
    lat: '24.1167',
    cities: [
      { name: 'Aswan', nameAr: 'أسوان', long: '32.9000', lat: '24.1167' },
      {
        name: 'Abu Simbel',
        nameAr: 'أبو سمبل',
        long: '31.6167',
        lat: '22.3333',
      },
      { name: 'Kom Ombo', nameAr: 'كوم أمبو', long: '32.9500', lat: '24.4333' },
      { name: 'Edfu', nameAr: 'إدفو', long: '32.8833', lat: '24.9667' },
      { name: 'Philae', nameAr: 'فيلة', long: '32.8833', lat: '24.2833' },
      {
        name: 'Elephantine',
        nameAr: 'الفنتين',
        long: '32.9000',
        lat: '24.0833',
      },
      { name: 'Syene', nameAr: 'سوان', long: '32.8833', lat: '24.1167' },
      { name: 'Al Dabbah', nameAr: 'الدبة', long: '32.8167', lat: '24.2667' },
      { name: 'Nekhel', nameAr: 'نخل', long: '33.0500', lat: '26.2833' },
      {
        name: 'Ras Al Him',
        nameAr: 'رأس الحد',
        long: '32.7000',
        lat: '23.7500',
      },
    ],
  },
  {
    name: 'Matrouh',
    nameAr: 'مطروح',
    long: '25.0667',
    lat: '31.3500',
    cities: [
      {
        name: 'Marsa Matrouh',
        nameAr: 'مرسى مطروح',
        long: '25.0667',
        lat: '31.3500',
      },
      {
        name: 'Alexandria',
        nameAr: 'الإسكندرية',
        long: '29.9311',
        lat: '31.2001',
      },
      {
        name: 'El Alamein',
        nameAr: 'العلمين',
        long: '28.9500',
        lat: '30.8333',
      },
      {
        name: 'Sidi Barrani',
        nameAr: 'سيدي براني',
        long: '26.5000',
        lat: '31.6500',
      },
      {
        name: 'Mersa Matruh',
        nameAr: 'مرسى مطروح',
        long: '25.0667',
        lat: '31.3500',
      },
      { name: 'Al Hamam', nameAr: 'الحمام', long: '27.0833', lat: '31.4667' },
      { name: 'Dabaa', nameAr: 'دبا', long: '28.1333', lat: '31.3333' },
      { name: 'Alamein', nameAr: 'العلمين', long: '28.9500', lat: '30.8333' },
      { name: 'Marina', nameAr: 'مارينا', long: '28.9833', lat: '31.4500' },
      { name: 'Zagazig', nameAr: 'الزقازيق', long: '31.5000', lat: '30.5833' },
    ],
  },
  {
    name: 'North Sinai',
    nameAr: 'شمالسيناء',
    long: '34.0000',
    lat: '31.0000',
    cities: [
      { name: 'Arish', nameAr: 'العريش', long: '33.8000', lat: '31.1333' },
      { name: 'Rafah', nameAr: 'رفح', long: '34.2500', lat: '31.2833' },
      {
        name: 'Sheikh Zuweid',
        nameAr: 'الشيخ زويد',
        long: '33.9833',
        lat: '31.1500',
      },
      { name: 'Al Hasana', nameAr: 'الحسنة', long: '34.0833', lat: '31.0833' },
      {
        name: 'Bir al-Abed',
        nameAr: 'بير العبد',
        long: '34.1000',
        lat: '31.0833',
      },
      {
        name: 'Tal Al Sultan',
        nameAr: 'تل السلطان',
        long: '34.2000',
        lat: '31.2167',
      },
      { name: 'Al Mazar', nameAr: 'المزار', long: '33.8500', lat: '31.1833' },
      { name: 'Al Nakhla', nameAr: 'النخلة', long: '34.0500', lat: '31.0500' },
      {
        name: 'Wadi Al Mukhtar',
        nameAr: 'وادي المختار',
        long: '34.1833',
        lat: '31.1833',
      },
    ],
  },
  {
    name: 'South Sinai',
    nameAr: 'جنوبسيناء',
    long: '34.0000',
    lat: '28.0000',
    cities: [
      {
        name: 'Sharm El Sheikh',
        nameAr: 'شرم الشيخ',
        long: '34.3615',
        lat: '27.9104',
      },
      { name: 'Dahab', nameAr: 'دهب', long: '34.4833', lat: '28.4833' },
      { name: 'Nuweiba', nameAr: 'نويبع', long: '34.6333', lat: '28.9333' },
      { name: 'Taba', nameAr: 'طابا', long: '34.9000', lat: '29.5000' },
      {
        name: 'Saint Catherine',
        nameAr: 'سانت كاترين',
        long: '33.9500',
        lat: '28.5667',
      },
      { name: 'Ras Sudr', nameAr: 'رأس سدر', long: '33.9333', lat: '29.0500' },
      {
        name: 'Marsa Alam',
        nameAr: 'مرسى علم',
        long: '34.8833',
        lat: '25.0667',
      },
      { name: 'Soma Bay', nameAr: 'سوما باي', long: '34.0000', lat: '26.8500' },
      { name: 'El Tor', nameAr: 'الطور', long: '33.6167', lat: '28.2333' },
      {
        name: 'Abu Rudies',
        nameAr: 'أبو رواد',
        long: '33.1833',
        lat: '27.8167',
      },
    ],
  },
  {
    name: '6th of October',
    nameAr: 'السادس من أكتوبر',
    long: '30.9725',
    lat: '29.9383',
    cities: [
      {
        name: '6th of October City',
        nameAr: 'مدينة السادس من أكتوبر',
        long: '30.9725',
        lat: '29.9383',
      },
      {
        name: 'Sheikh Zayed',
        nameAr: 'الشيخ زايد',
        long: '30.9889',
        lat: '30.0092',
      },
      {
        name: 'Industrial Zone',
        nameAr: 'المنطقة الصناعية',
        long: '30.9500',
        lat: '29.9500',
      },
      {
        name: 'Central Business District',
        nameAr: 'وسط القاهرة الجديدة',
        long: '30.9667',
        lat: '29.9667',
      },
      {
        name: 'Dreamland',
        nameAr: 'دريم لاند',
        long: '30.9833',
        lat: '29.9333',
      },
      {
        name: 'Grand Heights',
        nameAr: 'جراند هايتس',
        long: '30.9500',
        lat: '29.9167',
      },
      {
        name: 'Family Village',
        nameAr: 'فاميلي فيليج',
        long: '30.9333',
        lat: '29.9500',
      },
      { name: 'Al Motley', nameAr: 'الموتلي', long: '30.9667', lat: '29.9833' },
    ],
  },
  {
    name: 'Alamein',
    nameAr: 'العلمين',
    long: '28.9500',
    lat: '30.8333',
    cities: [
      {
        name: 'Al Alamein City',
        nameAr: 'مدينة العلمين',
        long: '28.9500',
        lat: '30.8333',
      },
      { name: 'Marina', nameAr: 'مارينا', long: '28.9833', lat: '31.4500' },
      {
        name: 'North Coast',
        nameAr: 'الساحل الشمالي',
        long: '29.0000',
        lat: '31.0000',
      },
      { name: 'El Dabaa', nameAr: 'الضبعة', long: '28.1333', lat: '31.3333' },
      {
        name: 'Alamein Resort',
        nameAr: 'منتجع العلمين',
        long: '28.9333',
        lat: '30.8167',
      },
      {
        name: 'Sidi Abdallah',
        nameAr: 'سيدي عبد الله',
        long: '28.9000',
        lat: '30.8000',
      },
      { name: 'Al Bahr', nameAr: 'البحر', long: '29.0167', lat: '30.8500' },
      {
        name: 'Al Ghandour',
        nameAr: 'القطور',
        long: '31.2500',
        lat: '30.8000',
      },
    ],
  },
];

async function main() {
  console.log('Starting database seeding...');

  try {
    console.log('\n--- Seeding Governments and Cities ---');

    for (const gov of egyptData) {
      let govRecord = await prisma.government.findFirst({
        where: { name: gov.name },
      });
      if (!govRecord) {
        govRecord = await prisma.government.create({
          data: {
            name: gov.name,
            nameAr: gov.nameAr,
            long: parseFloat(gov.long),
            lat: parseFloat(gov.lat),
          },
        });
        console.log(`Created government: ${govRecord.name}`);
      } else {
        await prisma.government.update({
          where: { id: govRecord.id },
          data: { nameAr: gov.nameAr, long: parseFloat(gov.long), lat: parseFloat(gov.lat) },
        });
        console.log(`Updated government: ${govRecord.name}`);
      }

      if (firstGovId === null) {
        firstGovId = govRecord.id;
      }

      for (const city of gov.cities) {
        let cityRecord = await prisma.city.findFirst({
          where: { name: city.name, governmentId: govRecord.id },
        });
        if (!cityRecord) {
          cityRecord = await prisma.city.create({
            data: {
              name: city.name,
              nameAr: city.nameAr,
              long: parseFloat(city.long),
              lat: parseFloat(city.lat),
              governmentId: govRecord.id,
            },
          });
          console.log(`  - Created city: ${cityRecord.name}`);
        } else {
          await prisma.city.update({
            where: { id: cityRecord.id },
            data: { nameAr: city.nameAr, long: parseFloat(city.long), lat: parseFloat(city.lat) },
          });
          console.log(`  - Updated city: ${cityRecord.name}`);
        }

        if (firstGovId === govRecord.id && firstCityId === null) {
          firstCityId = cityRecord.id;
        }
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
