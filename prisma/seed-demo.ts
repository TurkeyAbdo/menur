import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Get themes for linking
  const lightTheme = await prisma.theme.findUnique({ where: { slug: "light" } });
  const darkTheme = await prisma.theme.findUnique({ where: { slug: "dark" } });
  const elegantTheme = await prisma.theme.findUnique({ where: { slug: "elegant" } });
  const modernTheme = await prisma.theme.findUnique({ where: { slug: "modern" } });
  const roseTheme = await prisma.theme.findUnique({ where: { slug: "rose" } });

  if (!lightTheme || !darkTheme || !elegantTheme) {
    console.error("Themes not found. Run `npx prisma db seed` first.");
    return;
  }

  // ── Create User ──
  const password = await bcrypt.hash("demo123456", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@menur.app" },
    update: {},
    create: {
      email: "demo@menur.app",
      name: "عبدالله المطعم",
      password,
      role: "OWNER",
      provider: "EMAIL",
    },
  });

  // ── Create Pro Subscription ──
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { tier: "PRO", status: "ACTIVE" },
    create: {
      userId: user.id,
      tier: "PRO",
      status: "ACTIVE",
      priceAmount: 94.78,
      vatAmount: 14.22,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  // ── Create Restaurant ──
  const restaurant = await prisma.restaurant.upsert({
    where: { ownerId: user.id },
    update: {},
    create: {
      name: "Diwan Al-Sultan",
      nameAr: "ديوان السلطان",
      slug: "diwan-al-sultan",
      description: "A premium Saudi restaurant offering authentic traditional dishes with a modern twist. From freshly baked bread to slow-cooked lamb, every dish tells a story of Arabian hospitality.",
      descriptionAr: "مطعم سعودي فاخر يقدم أطباقاً تراثية أصيلة بلمسة عصرية. من الخبز الطازج إلى لحم الضأن المطهو ببطء، كل طبق يحكي قصة الضيافة العربية.",
      phone: "+966501234567",
      email: "info@diwanalsultan.sa",
      website: "https://diwanalsultan.sa",
      instagram: "diwanalsultan",
      twitter: "diwanalsultan",
      tiktok: "diwanalsultan",
      snapchat: "diwanalsultan",
      ownerId: user.id,
    },
  });

  // ── Create 5 Locations ──
  const locationsData = [
    {
      name: "Riyadh - Olaya Branch",
      nameAr: "الرياض - فرع العليا",
      address: "Olaya Street, Al Olaya District",
      addressAr: "شارع العليا، حي العليا",
      city: "Riyadh",
      region: "Riyadh",
      phone: "+966501234567",
      openingHours: {
        sunday: { open: "12:00", close: "00:00" },
        monday: { open: "12:00", close: "00:00" },
        tuesday: { open: "12:00", close: "00:00" },
        wednesday: { open: "12:00", close: "00:00" },
        thursday: { open: "12:00", close: "01:00" },
        friday: { open: "13:00", close: "01:00" },
        saturday: { open: "12:00", close: "00:00" },
      },
    },
    {
      name: "Jeddah - Tahlia Branch",
      nameAr: "جدة - فرع التحلية",
      address: "Tahlia Street, Al Rawdah District",
      addressAr: "شارع التحلية، حي الروضة",
      city: "Jeddah",
      region: "Makkah",
      phone: "+966502345678",
      openingHours: {
        sunday: { open: "11:00", close: "23:30" },
        monday: { open: "11:00", close: "23:30" },
        tuesday: { open: "11:00", close: "23:30" },
        wednesday: { open: "11:00", close: "23:30" },
        thursday: { open: "11:00", close: "00:30" },
        friday: { open: "13:00", close: "00:30" },
        saturday: { open: "11:00", close: "23:30" },
      },
    },
    {
      name: "Dammam - Corniche Branch",
      nameAr: "الدمام - فرع الكورنيش",
      address: "King Fahd Corniche, Al Shati District",
      addressAr: "كورنيش الملك فهد، حي الشاطئ",
      city: "Dammam",
      region: "Eastern Province",
      phone: "+966503456789",
      openingHours: {
        sunday: { open: "12:00", close: "23:00" },
        monday: { open: "12:00", close: "23:00" },
        tuesday: { open: "12:00", close: "23:00" },
        wednesday: { open: "12:00", close: "23:00" },
        thursday: { open: "12:00", close: "00:00" },
        friday: { open: "13:00", close: "00:00" },
        saturday: { open: "12:00", close: "23:00" },
      },
    },
    {
      name: "Makkah - Al Aziziyah Branch",
      nameAr: "مكة - فرع العزيزية",
      address: "Al Aziziyah District, Third Ring Road",
      addressAr: "حي العزيزية، الطريق الدائري الثالث",
      city: "Makkah",
      region: "Makkah",
      phone: "+966504567890",
      openingHours: {
        sunday: { open: "10:00", close: "01:00" },
        monday: { open: "10:00", close: "01:00" },
        tuesday: { open: "10:00", close: "01:00" },
        wednesday: { open: "10:00", close: "01:00" },
        thursday: { open: "10:00", close: "02:00" },
        friday: { open: "13:00", close: "02:00" },
        saturday: { open: "10:00", close: "01:00" },
      },
    },
    {
      name: "Madinah - Central Branch",
      nameAr: "المدينة - الفرع المركزي",
      address: "King Faisal Road, Al Uyun District",
      addressAr: "طريق الملك فيصل، حي العيون",
      city: "Madinah",
      region: "Madinah",
      phone: "+966505678901",
      openingHours: {
        sunday: { open: "11:00", close: "00:00" },
        monday: { open: "11:00", close: "00:00" },
        tuesday: { open: "11:00", close: "00:00" },
        wednesday: { open: "11:00", close: "00:00" },
        thursday: { open: "11:00", close: "01:00" },
        friday: { open: "13:00", close: "01:00" },
        saturday: { open: "11:00", close: "00:00" },
      },
    },
  ];

  // Delete old locations for this restaurant
  await prisma.location.deleteMany({ where: { restaurantId: restaurant.id } });

  const locations = [];
  for (const loc of locationsData) {
    const created = await prisma.location.create({
      data: { ...loc, restaurantId: restaurant.id },
    });
    locations.push(created);
  }

  // ── Delete old menus for clean slate ──
  await prisma.menu.deleteMany({ where: { restaurantId: restaurant.id } });

  // ── MENU 1: Main Menu (Elegant theme, Scrollable, Published) ──
  const menu1 = await prisma.menu.create({
    data: {
      name: "Main Menu",
      nameAr: "القائمة الرئيسية",
      description: "Our signature dishes and classic favorites",
      descriptionAr: "أطباقنا المميزة والكلاسيكية المفضلة",
      layout: "SCROLLABLE",
      status: "PUBLISHED",
      restaurantId: restaurant.id,
      locationId: locations[0].id,
      themeId: elegantTheme.id,
      categories: {
        create: [
          {
            name: "Appetizers",
            nameAr: "المقبلات",
            description: "Start your meal right",
            descriptionAr: "ابدأ وجبتك بشكل صحيح",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Hummus",
                  nameAr: "حمص",
                  description: "Creamy chickpea dip with tahini, lemon, and olive oil",
                  descriptionAr: "غموس حمص كريمي مع طحينة وليمون وزيت زيتون",
                  price: 18,
                  dietaryTags: ["vegan", "gluten-free"],
                  allergens: ["sesame"],
                  sortOrder: 0,
                  variants: {
                    create: [
                      { name: "With Meat", nameAr: "مع لحم", priceModifier: 8 },
                      { name: "With Pine Nuts", nameAr: "مع صنوبر", priceModifier: 5 },
                    ],
                  },
                },
                {
                  name: "Mutabbal",
                  nameAr: "متبل",
                  description: "Smoky roasted eggplant dip with tahini and pomegranate",
                  descriptionAr: "متبل باذنجان مشوي مدخن مع طحينة ورمان",
                  price: 20,
                  dietaryTags: ["vegan", "gluten-free"],
                  allergens: ["sesame"],
                  sortOrder: 1,
                },
                {
                  name: "Fattoush Salad",
                  nameAr: "سلطة فتوش",
                  description: "Crispy bread salad with fresh vegetables and sumac dressing",
                  descriptionAr: "سلطة خبز مقرمش مع خضروات طازجة وصلصة السماق",
                  price: 22,
                  dietaryTags: ["vegan"],
                  allergens: ["gluten"],
                  sortOrder: 2,
                },
                {
                  name: "Sambousek",
                  nameAr: "سمبوسك",
                  description: "Crispy pastry filled with spiced meat or cheese",
                  descriptionAr: "معجنات مقرمشة محشوة بلحم متبل أو جبن",
                  price: 25,
                  allergens: ["gluten", "dairy"],
                  sortOrder: 3,
                  variants: {
                    create: [
                      { name: "Meat (6 pcs)", nameAr: "لحم (٦ قطع)", priceModifier: 0 },
                      { name: "Cheese (6 pcs)", nameAr: "جبن (٦ قطع)", priceModifier: 0 },
                      { name: "Mixed (12 pcs)", nameAr: "مشكل (١٢ قطعة)", priceModifier: 15 },
                    ],
                  },
                },
                {
                  name: "Vine Leaves",
                  nameAr: "ورق عنب",
                  description: "Stuffed grape leaves with rice, herbs and lemon",
                  descriptionAr: "ورق عنب محشو بالأرز والأعشاب والليمون",
                  price: 28,
                  dietaryTags: ["vegan"],
                  sortOrder: 4,
                },
              ],
            },
          },
          {
            name: "Grills",
            nameAr: "المشويات",
            description: "Charcoal grilled to perfection",
            descriptionAr: "مشوية على الفحم بإتقان",
            sortOrder: 1,
            items: {
              create: [
                {
                  name: "Mixed Grill Platter",
                  nameAr: "مشكل مشويات",
                  description: "Lamb chops, chicken shish, kafta kebab, and shish tawook",
                  descriptionAr: "ريش غنم، شيش دجاج، كباب كفتة، وشيش طاووق",
                  price: 95,
                  isSpecial: true,
                  sortOrder: 0,
                  variants: {
                    create: [
                      { name: "For 1 Person", nameAr: "لشخص واحد", priceModifier: 0 },
                      { name: "For 2 Persons", nameAr: "لشخصين", priceModifier: 65 },
                      { name: "Family (4 Persons)", nameAr: "عائلي (٤ أشخاص)", priceModifier: 155 },
                    ],
                  },
                },
                {
                  name: "Lamb Chops",
                  nameAr: "ريش غنم",
                  description: "Premium lamb chops marinated with herbs and grilled",
                  descriptionAr: "ريش غنم فاخرة متبلة بالأعشاب ومشوية",
                  price: 85,
                  sortOrder: 1,
                },
                {
                  name: "Chicken Shish Tawook",
                  nameAr: "شيش طاووق",
                  description: "Marinated chicken breast cubes grilled on skewers",
                  descriptionAr: "مكعبات صدر دجاج متبلة مشوية على أسياخ",
                  price: 55,
                  sortOrder: 2,
                },
                {
                  name: "Kafta Kebab",
                  nameAr: "كباب كفتة",
                  description: "Minced lamb kebab with parsley and onions",
                  descriptionAr: "كباب لحم مفروم مع بقدونس وبصل",
                  price: 50,
                  sortOrder: 3,
                },
                {
                  name: "Grilled Hammour",
                  nameAr: "هامور مشوي",
                  description: "Fresh hammour fish grilled with lemon and herbs",
                  descriptionAr: "سمك هامور طازج مشوي مع ليمون وأعشاب",
                  price: 75,
                  dietaryTags: ["gluten-free"],
                  allergens: ["fish"],
                  sortOrder: 4,
                },
              ],
            },
          },
          {
            name: "Main Courses",
            nameAr: "الأطباق الرئيسية",
            description: "Hearty traditional dishes",
            descriptionAr: "أطباق تراثية شهية",
            sortOrder: 2,
            items: {
              create: [
                {
                  name: "Kabsa",
                  nameAr: "كبسة",
                  description: "Traditional Saudi spiced rice with tender lamb, served with dakkous and salad",
                  descriptionAr: "أرز سعودي تقليدي متبل مع لحم غنم طري، يقدم مع دقوس وسلطة",
                  price: 65,
                  isSpecial: true,
                  dietaryTags: ["halal"],
                  sortOrder: 0,
                  variants: {
                    create: [
                      { name: "Lamb", nameAr: "لحم غنم", priceModifier: 0 },
                      { name: "Chicken", nameAr: "دجاج", priceModifier: -15 },
                      { name: "Shrimp", nameAr: "ربيان", priceModifier: 10 },
                    ],
                  },
                },
                {
                  name: "Mandi",
                  nameAr: "مندي",
                  description: "Slow-cooked lamb on fragrant basmati rice, Yemeni style",
                  descriptionAr: "لحم غنم مطهو ببطء على أرز بسمتي عطري، على الطريقة اليمنية",
                  price: 70,
                  dietaryTags: ["halal"],
                  sortOrder: 1,
                },
                {
                  name: "Machboos",
                  nameAr: "مجبوس",
                  description: "Gulf-style spiced rice with chicken and dried lime",
                  descriptionAr: "أرز خليجي متبل مع دجاج وليمون مجفف",
                  price: 55,
                  dietaryTags: ["halal"],
                  sortOrder: 2,
                },
                {
                  name: "Lamb Ouzi",
                  nameAr: "أوزي لحم",
                  description: "Whole roasted lamb stuffed with spiced rice, nuts and raisins",
                  descriptionAr: "خروف محشو بالأرز المتبل والمكسرات والزبيب",
                  price: 120,
                  dietaryTags: ["halal"],
                  allergens: ["nuts"],
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            name: "Desserts",
            nameAr: "الحلويات",
            description: "Sweet endings",
            descriptionAr: "نهايات حلوة",
            sortOrder: 3,
            items: {
              create: [
                {
                  name: "Kunafa",
                  nameAr: "كنافة",
                  description: "Crispy shredded pastry with sweet cheese and sugar syrup",
                  descriptionAr: "عجينة مبشورة مقرمشة مع جبنة حلوة وشراب السكر",
                  price: 30,
                  isSpecial: true,
                  allergens: ["gluten", "dairy"],
                  sortOrder: 0,
                },
                {
                  name: "Basbousa",
                  nameAr: "بسبوسة",
                  description: "Semolina cake soaked in rose water syrup with almonds",
                  descriptionAr: "كيكة سميد مغمورة بشراب ماء الورد مع لوز",
                  price: 22,
                  allergens: ["gluten", "nuts", "dairy"],
                  sortOrder: 1,
                },
                {
                  name: "Um Ali",
                  nameAr: "أم علي",
                  description: "Traditional bread pudding with cream, nuts and raisins",
                  descriptionAr: "حلوى خبز تقليدية مع كريمة ومكسرات وزبيب",
                  price: 28,
                  allergens: ["gluten", "dairy", "nuts"],
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: "Beverages",
            nameAr: "المشروبات",
            description: "Hot and cold drinks",
            descriptionAr: "مشروبات ساخنة وباردة",
            sortOrder: 4,
            items: {
              create: [
                {
                  name: "Arabic Coffee",
                  nameAr: "قهوة عربية",
                  description: "Traditional Saudi coffee with cardamom, served with dates",
                  descriptionAr: "قهوة سعودية تقليدية بالهيل، تقدم مع تمر",
                  price: 15,
                  dietaryTags: ["vegan"],
                  sortOrder: 0,
                },
                {
                  name: "Mint Lemon",
                  nameAr: "ليمون بالنعناع",
                  description: "Fresh lemon juice with mint leaves",
                  descriptionAr: "عصير ليمون طازج مع أوراق النعناع",
                  price: 18,
                  dietaryTags: ["vegan"],
                  sortOrder: 1,
                },
                {
                  name: "Saudi Champagne",
                  nameAr: "شمبانيا سعودي",
                  description: "Apple juice with sparkling water, mint and lime",
                  descriptionAr: "عصير تفاح مع ماء فوار ونعناع وليمون",
                  price: 22,
                  dietaryTags: ["vegan"],
                  sortOrder: 2,
                },
                {
                  name: "Karak Tea",
                  nameAr: "شاي كرك",
                  description: "Rich milk tea with cardamom and saffron",
                  descriptionAr: "شاي حليب غني بالهيل والزعفران",
                  price: 12,
                  allergens: ["dairy"],
                  sortOrder: 3,
                  variants: {
                    create: [
                      { name: "Regular", nameAr: "عادي", priceModifier: 0 },
                      { name: "With Saffron", nameAr: "بالزعفران", priceModifier: 5 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── MENU 2: Breakfast Menu (Light theme, Tabbed, Published) ──
  const menu2 = await prisma.menu.create({
    data: {
      name: "Breakfast Menu",
      nameAr: "قائمة الفطور",
      description: "Start your morning the Saudi way",
      descriptionAr: "ابدأ صباحك على الطريقة السعودية",
      layout: "TABBED",
      status: "PUBLISHED",
      restaurantId: restaurant.id,
      locationId: locations[1].id,
      themeId: lightTheme!.id,
      categories: {
        create: [
          {
            name: "Traditional Breakfast",
            nameAr: "فطور تقليدي",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Ful Medames",
                  nameAr: "فول مدمس",
                  description: "Slow-cooked fava beans with olive oil, tomato, and spices",
                  descriptionAr: "فول مطهو ببطء مع زيت زيتون وطماطم وبهارات",
                  price: 18,
                  dietaryTags: ["vegan"],
                  timeSlot: "BREAKFAST",
                  sortOrder: 0,
                },
                {
                  name: "Shakshuka",
                  nameAr: "شكشوكة",
                  description: "Eggs poached in spiced tomato sauce with peppers",
                  descriptionAr: "بيض مسلوق في صلصة طماطم متبلة مع فلفل",
                  price: 25,
                  allergens: ["eggs"],
                  timeSlot: "BREAKFAST",
                  sortOrder: 1,
                },
                {
                  name: "Masoub",
                  nameAr: "معصوب",
                  description: "Mashed banana bread with cream, honey and nuts",
                  descriptionAr: "خبز موز مهروس مع قشطة وعسل ومكسرات",
                  price: 30,
                  allergens: ["gluten", "dairy", "nuts"],
                  timeSlot: "BREAKFAST",
                  isSpecial: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: "Eggs & Omelettes",
            nameAr: "بيض وأومليت",
            sortOrder: 1,
            items: {
              create: [
                {
                  name: "Classic Omelette",
                  nameAr: "أومليت كلاسيك",
                  description: "Three-egg omelette with your choice of fillings",
                  descriptionAr: "أومليت ثلاث بيضات مع اختيارك من الحشوات",
                  price: 22,
                  allergens: ["eggs", "dairy"],
                  timeSlot: "BREAKFAST",
                  sortOrder: 0,
                  variants: {
                    create: [
                      { name: "Cheese & Herbs", nameAr: "جبن وأعشاب", priceModifier: 0 },
                      { name: "Mushroom & Spinach", nameAr: "فطر وسبانخ", priceModifier: 5 },
                      { name: "Beef Sausage", nameAr: "سجق لحم", priceModifier: 8 },
                    ],
                  },
                },
                {
                  name: "Eggs Benedict",
                  nameAr: "بيض بينيدكت",
                  description: "Poached eggs on English muffin with hollandaise",
                  descriptionAr: "بيض مسلوق على خبز إنجليزي مع صلصة هولنديز",
                  price: 35,
                  allergens: ["eggs", "gluten", "dairy"],
                  timeSlot: "BREAKFAST",
                  sortOrder: 1,
                },
              ],
            },
          },
          {
            name: "Fresh Juices",
            nameAr: "عصائر طازجة",
            sortOrder: 2,
            items: {
              create: [
                {
                  name: "Orange Juice",
                  nameAr: "عصير برتقال",
                  description: "Freshly squeezed orange juice",
                  descriptionAr: "عصير برتقال طازج",
                  price: 15,
                  dietaryTags: ["vegan"],
                  timeSlot: "BREAKFAST",
                  sortOrder: 0,
                },
                {
                  name: "Mixed Berry Smoothie",
                  nameAr: "سموذي توت مشكل",
                  description: "Blended berries with yogurt and honey",
                  descriptionAr: "توت مشكل مخلوط مع زبادي وعسل",
                  price: 22,
                  allergens: ["dairy"],
                  timeSlot: "BREAKFAST",
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── MENU 3: Catering Menu (Dark theme, Scrollable, Published) ──
  const menu3 = await prisma.menu.create({
    data: {
      name: "Catering Menu",
      nameAr: "قائمة التموين",
      description: "Special packages for events and gatherings",
      descriptionAr: "باقات خاصة للمناسبات والتجمعات",
      layout: "SCROLLABLE",
      status: "PUBLISHED",
      restaurantId: restaurant.id,
      themeId: darkTheme!.id,
      categories: {
        create: [
          {
            name: "Platters",
            nameAr: "أطباق كبيرة",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Mezza Platter (10 Persons)",
                  nameAr: "طبق مزة (١٠ أشخاص)",
                  description: "Hummus, mutabbal, fattoush, tabbouleh, sambousek, vine leaves",
                  descriptionAr: "حمص، متبل، فتوش، تبولة، سمبوسك، ورق عنب",
                  price: 180,
                  isSpecial: true,
                  sortOrder: 0,
                },
                {
                  name: "Grill Platter (10 Persons)",
                  nameAr: "طبق مشويات (١٠ أشخاص)",
                  description: "Mixed grill with rice, bread, and sauces",
                  descriptionAr: "مشكل مشويات مع أرز وخبز وصلصات",
                  price: 450,
                  sortOrder: 1,
                },
                {
                  name: "Full Lamb Mandi",
                  nameAr: "مندي خروف كامل",
                  description: "Whole lamb slow-cooked on mandi rice for 15-20 persons",
                  descriptionAr: "خروف كامل مطهو ببطء على أرز مندي لـ ١٥-٢٠ شخص",
                  price: 850,
                  isSpecial: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: "Dessert Trays",
            nameAr: "صواني حلويات",
            sortOrder: 1,
            items: {
              create: [
                {
                  name: "Kunafa Tray",
                  nameAr: "صينية كنافة",
                  description: "Full tray of kunafa serves 10-12 persons",
                  descriptionAr: "صينية كنافة كاملة تكفي ١٠-١٢ شخص",
                  price: 150,
                  allergens: ["gluten", "dairy"],
                  sortOrder: 0,
                },
                {
                  name: "Assorted Baklava Box",
                  nameAr: "علبة بقلاوة مشكلة",
                  description: "Premium assorted baklava - 1kg box",
                  descriptionAr: "بقلاوة مشكلة فاخرة - علبة ١ كيلو",
                  price: 120,
                  allergens: ["gluten", "nuts"],
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── MENU 4: Drinks Menu (Modern theme, Tabbed, Published) ──
  const menu4 = await prisma.menu.create({
    data: {
      name: "Drinks & Beverages",
      nameAr: "المشروبات",
      description: "Hot and cold specialty drinks",
      descriptionAr: "مشروبات ساخنة وباردة مميزة",
      layout: "TABBED",
      status: "PUBLISHED",
      restaurantId: restaurant.id,
      locationId: locations[2].id,
      themeId: modernTheme!.id,
      categories: {
        create: [
          {
            name: "Hot Drinks",
            nameAr: "مشروبات ساخنة",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Saffron Latte",
                  nameAr: "لاتيه زعفران",
                  description: "Espresso with steamed milk and premium saffron",
                  descriptionAr: "إسبريسو مع حليب مبخر وزعفران فاخر",
                  price: 25,
                  isSpecial: true,
                  allergens: ["dairy"],
                  sortOrder: 0,
                },
                {
                  name: "Turkish Coffee",
                  nameAr: "قهوة تركية",
                  description: "Traditional Turkish coffee with cardamom",
                  descriptionAr: "قهوة تركية تقليدية بالهيل",
                  price: 15,
                  dietaryTags: ["vegan"],
                  sortOrder: 1,
                },
                {
                  name: "Hot Chocolate",
                  nameAr: "شوكولاتة ساخنة",
                  description: "Rich Belgian hot chocolate with whipped cream",
                  descriptionAr: "شوكولاتة بلجيكية ساخنة غنية مع كريمة مخفوقة",
                  price: 22,
                  allergens: ["dairy"],
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: "Cold Drinks",
            nameAr: "مشروبات باردة",
            sortOrder: 1,
            items: {
              create: [
                {
                  name: "Iced Spanish Latte",
                  nameAr: "لاتيه إسباني مثلج",
                  description: "Espresso with condensed milk over ice",
                  descriptionAr: "إسبريسو مع حليب مكثف على الثلج",
                  price: 22,
                  allergens: ["dairy"],
                  sortOrder: 0,
                },
                {
                  name: "Pistachio Milkshake",
                  nameAr: "ميلك شيك فستق",
                  description: "Creamy milkshake with premium pistachio",
                  descriptionAr: "ميلك شيك كريمي بالفستق الفاخر",
                  price: 28,
                  allergens: ["dairy", "nuts"],
                  isSpecial: true,
                  sortOrder: 1,
                },
                {
                  name: "Fresh Watermelon Juice",
                  nameAr: "عصير بطيخ طازج",
                  description: "Freshly blended watermelon with mint",
                  descriptionAr: "بطيخ طازج مخلوط مع نعناع",
                  price: 18,
                  dietaryTags: ["vegan"],
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: "Mojitos",
            nameAr: "موهيتو",
            sortOrder: 2,
            items: {
              create: [
                {
                  name: "Classic Mojito",
                  nameAr: "موهيتو كلاسيك",
                  description: "Lime, mint, sugar, and sparkling water",
                  descriptionAr: "ليمون، نعناع، سكر، وماء فوار",
                  price: 20,
                  dietaryTags: ["vegan"],
                  sortOrder: 0,
                },
                {
                  name: "Passion Fruit Mojito",
                  nameAr: "موهيتو باشن فروت",
                  description: "Tropical passion fruit with mint and lime",
                  descriptionAr: "باشن فروت استوائي مع نعناع وليمون",
                  price: 24,
                  dietaryTags: ["vegan"],
                  sortOrder: 1,
                },
                {
                  name: "Strawberry Mojito",
                  nameAr: "موهيتو فراولة",
                  description: "Fresh strawberries with mint and lime",
                  descriptionAr: "فراولة طازجة مع نعناع وليمون",
                  price: 24,
                  dietaryTags: ["vegan"],
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── MENU 5: Draft Ramadan Menu (Rose theme, Scrollable, Draft) ──
  const menu5 = await prisma.menu.create({
    data: {
      name: "Ramadan Iftar Menu",
      nameAr: "قائمة إفطار رمضان",
      description: "Special iftar packages for the holy month",
      descriptionAr: "باقات إفطار خاصة للشهر الكريم",
      layout: "SCROLLABLE",
      status: "DRAFT",
      restaurantId: restaurant.id,
      themeId: roseTheme?.id || elegantTheme.id,
      categories: {
        create: [
          {
            name: "Iftar Sets",
            nameAr: "أطقم إفطار",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Individual Iftar Set",
                  nameAr: "طقم إفطار فردي",
                  description: "Dates, soup, salad, main course, dessert, and drink",
                  descriptionAr: "تمر، شوربة، سلطة، طبق رئيسي، حلو، ومشروب",
                  price: 75,
                  isSpecial: true,
                  sortOrder: 0,
                },
                {
                  name: "Family Iftar Set (4 Persons)",
                  nameAr: "طقم إفطار عائلي (٤ أشخاص)",
                  description: "Complete iftar spread for the whole family",
                  descriptionAr: "مائدة إفطار كاملة لجميع أفراد العائلة",
                  price: 250,
                  isSpecial: true,
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── Create QR Codes ──
  const slug = "diwan-al-sultan";
  const qrCodesData = [
    // Menu 1 QR codes - table specific
    { label: "Table 1", menuId: menu1.id, config: { foreground: "#1e293b", background: "#ffffff", style: "rounded" } },
    { label: "Table 2", menuId: menu1.id, config: { foreground: "#1e293b", background: "#ffffff", style: "rounded" } },
    { label: "Table 3", menuId: menu1.id, config: { foreground: "#1e293b", background: "#ffffff", style: "rounded" } },
    { label: "Table 4", menuId: menu1.id, config: { foreground: "#8b6f47", background: "#faf7f2", style: "dots" } },
    { label: "Table 5", menuId: menu1.id, config: { foreground: "#8b6f47", background: "#faf7f2", style: "dots" } },
    { label: "Table 6", menuId: menu1.id, config: { foreground: "#8b6f47", background: "#faf7f2", style: "dots" } },
    { label: "VIP Room 1", menuId: menu1.id, config: { foreground: "#c5a572", background: "#1a1a1a", style: "dots" } },
    { label: "VIP Room 2", menuId: menu1.id, config: { foreground: "#c5a572", background: "#1a1a1a", style: "dots" } },
    // Menu 2 QR codes
    { label: "Breakfast Counter", menuId: menu2.id, config: { foreground: "#6366f1", background: "#ffffff", style: "rounded" } },
    { label: "Terrace", menuId: menu2.id, config: { foreground: "#6366f1", background: "#ffffff", style: "rounded" } },
    // Menu 3 QR code
    { label: "Catering Desk", menuId: menu3.id, config: { foreground: "#818cf8", background: "#0f172a", style: "square" } },
    // Menu 4 QR codes
    { label: "Bar Counter", menuId: menu4.id, config: { foreground: "#3b82f6", background: "#0c1222", style: "dots" } },
    { label: "Lounge Area", menuId: menu4.id, config: { foreground: "#22d3ee", background: "#0c1222", style: "dots" } },
  ];

  const qrCodes = [];
  for (const qr of qrCodesData) {
    const created = await prisma.qRCode.create({
      data: {
        label: qr.label,
        menuId: qr.menuId,
        config: qr.config,
        menuUrl: `/menu/${slug}`,
      },
    });
    qrCodes.push(created);
  }

  // ── Create Scan Data (for analytics) ──
  const devices = ["mobile", "tablet", "desktop"];
  const cities = ["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"];
  const userAgents = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
    "Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S24)",
    "Mozilla/5.0 (iPad; CPU OS 17_0)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8)",
  ];

  const scansToCreate = [];
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const numScans = Math.floor(Math.random() * 15) + 5; // 5-20 scans per day
    for (let s = 0; s < numScans; s++) {
      const scanDate = new Date();
      scanDate.setDate(scanDate.getDate() - dayOffset);
      scanDate.setHours(Math.floor(Math.random() * 14) + 10); // 10am - midnight
      scanDate.setMinutes(Math.floor(Math.random() * 60));

      scansToCreate.push({
        qrCodeId: qrCodes[Math.floor(Math.random() * qrCodes.length)].id,
        timestamp: scanDate,
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        country: "Saudi Arabia",
        latitude: 24.7136 + (Math.random() - 0.5) * 4,
        longitude: 46.6753 + (Math.random() - 0.5) * 8,
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      });
    }
  }

  await prisma.scan.createMany({ data: scansToCreate });

  // ── Create Notifications ──
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "WELCOME",
        title: "Welcome to Menur!",
        titleAr: "مرحباً بك في منيور!",
        message: "Your account has been created successfully. Start building your digital menu today!",
        messageAr: "تم إنشاء حسابك بنجاح. ابدأ بناء قائمتك الرقمية اليوم!",
        isRead: true,
      },
      {
        userId: user.id,
        type: "SYSTEM",
        title: "Pro Plan Activated",
        titleAr: "تم تفعيل الباقة الاحترافية",
        message: "Your Pro subscription is now active. Enjoy unlimited menus, QR codes, and up to 5 locations!",
        messageAr: "اشتراكك الاحترافي فعال الآن. استمتع بقوائم وأكواد QR غير محدودة وحتى ٥ فروع!",
        isRead: true,
      },
      {
        userId: user.id,
        type: "WEEKLY_REPORT",
        title: "Weekly Scan Report",
        titleAr: "تقرير المسح الأسبوعي",
        message: "Your menus received 127 scans this week! Top menu: Main Menu with 78 scans.",
        messageAr: "قوائمك حصلت على ١٢٧ مسحة هذا الأسبوع! أعلى قائمة: القائمة الرئيسية بـ ٧٨ مسحة.",
        isRead: false,
      },
      {
        userId: user.id,
        type: "MENU_TIP",
        title: "Tip: Add photos to your items",
        titleAr: "نصيحة: أضف صور لأصنافك",
        message: "Menus with photos get 40% more engagement. Upload high-quality photos of your dishes!",
        messageAr: "القوائم التي تحتوي على صور تحصل على تفاعل أكثر بنسبة ٤٠٪. ارفع صوراً عالية الجودة لأطباقك!",
        isRead: false,
      },
      {
        userId: user.id,
        type: "SUBSCRIPTION_EXPIRING",
        title: "Subscription Renewal Coming Up",
        titleAr: "تجديد الاشتراك قريباً",
        message: "Your Pro subscription will renew in 5 days. Make sure your payment method is up to date.",
        messageAr: "سيتم تجديد اشتراكك الاحترافي خلال ٥ أيام. تأكد من تحديث طريقة الدفع.",
        isRead: false,
      },
    ],
  });

  // ── Create Customer Feedback ──
  // Create a few customer accounts for feedback
  const customerNames = [
    { name: "سارة الأحمد", email: "sara@example.com" },
    { name: "محمد العتيبي", email: "mohammed@example.com" },
    { name: "نورة القحطاني", email: "noura@example.com" },
    { name: "فهد السعيد", email: "fahad@example.com" },
    { name: "ريم الشمري", email: "reem@example.com" },
  ];

  const customerPassword = await bcrypt.hash("customer123", 12);
  for (const c of customerNames) {
    const customer = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: c.name,
        password: customerPassword,
        role: "CUSTOMER",
        provider: "EMAIL",
      },
    });

    // Random feedback for menu1
    await prisma.customerFeedback.create({
      data: {
        userId: customer.id,
        menuId: menu1.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: [
          "أفضل كبسة في الرياض! الطعم لا يوصف 🔥",
          "مكان رائع وخدمة ممتازة، ننصح بالمشويات",
          "الأجواء جميلة والأكل لذيذ جداً",
          "تجربة فريدة من نوعها، سأعود بالتأكيد",
          "الكنافة هنا أسطورية! والقهوة العربية ممتازة",
        ][customerNames.indexOf(c)],
      },
    });
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Demo account created successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("  Email:    demo@menur.app");
  console.log("  Password: demo123456");
  console.log("  Tier:     PRO");
  console.log("");
  console.log("  Restaurant: Diwan Al-Sultan (ديوان السلطان)");
  console.log("  Locations:  5 (Riyadh, Jeddah, Dammam, Makkah, Madinah)");
  console.log("  Menus:      5 (4 published + 1 draft)");
  console.log("  QR Codes:   13");
  console.log("  Scans:      ~300+ (30 days of data)");
  console.log("");
  console.log("  Public menu: http://localhost:3000/menu/diwan-al-sultan");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
