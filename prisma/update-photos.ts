import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function searchMealDB(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return (data.meals || []).map((m: any) => m.strMealThumb as string);
  } catch {
    return [];
  }
}

async function filterByArea(area: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
    );
    const data = await res.json();
    return (data.meals || []).map((m: any) => m.strMealThumb as string);
  } catch {
    return [];
  }
}

async function filterByCategory(cat: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`
    );
    const data = await res.json();
    return (data.meals || []).map((m: any) => m.strMealThumb as string);
  } catch {
    return [];
  }
}

async function main() {
  console.log("Fetching food images from TheMealDB...\n");

  // 1) Fetch images by search terms (parallel)
  const searchTerms = [
    "hummus", "kebab", "kofta", "lamb", "chicken", "fish",
    "salad", "coffee", "tea", "juice", "lemonade", "chocolate",
    "cake", "pudding", "pastry", "omelette", "eggs",
    "rice", "biryani", "soup", "shakshuka", "baklava",
    "falafel", "shawarma", "couscous",
  ];

  const searchResults = await Promise.all(
    searchTerms.map(async (term) => {
      const images = await searchMealDB(term);
      return { term, images };
    })
  );

  const pool: Record<string, string[]> = {};
  for (const { term, images } of searchResults) {
    pool[term] = images;
    if (images.length > 0) console.log(`  ${term}: ${images.length} images`);
  }

  // 2) Fetch by area for Middle Eastern food
  const areaResults = await Promise.all(
    ["Turkish", "Egyptian", "Moroccan", "Tunisian"].map(async (area) => {
      const images = await filterByArea(area);
      return { area, images };
    })
  );

  const areaPool: string[] = [];
  for (const { area, images } of areaResults) {
    areaPool.push(...images);
    if (images.length > 0) console.log(`  Area ${area}: ${images.length} images`);
  }

  // 3) Fetch by category for fallbacks
  const catResults = await Promise.all(
    ["Lamb", "Chicken", "Seafood", "Beef", "Dessert", "Side", "Starter", "Breakfast"].map(
      async (cat) => {
        const images = await filterByCategory(cat);
        return { cat, images };
      }
    )
  );

  const categoryPool: Record<string, string[]> = {};
  for (const { cat, images } of catResults) {
    categoryPool[cat] = images;
    if (images.length > 0) console.log(`  Category ${cat}: ${images.length} images`);
  }

  // Build item → image mapping with priorities
  const itemMapping: Record<string, { search: string[]; category: string[] }> = {
    // Appetizers
    "Hummus": { search: ["hummus", "falafel"], category: ["Starter", "Side"] },
    "Mutabbal": { search: ["hummus", "falafel"], category: ["Starter", "Side"] },
    "Fattoush Salad": { search: ["salad", "couscous"], category: ["Starter", "Side"] },
    "Sambousek": { search: ["falafel", "pastry"], category: ["Starter"] },
    "Vine Leaves": { search: ["falafel", "couscous"], category: ["Starter", "Side"] },
    // Grills
    "Mixed Grill Platter": { search: ["kebab", "shawarma", "kofta"], category: ["Lamb", "Beef"] },
    "Lamb Chops": { search: ["lamb"], category: ["Lamb"] },
    "Chicken Shish Tawook": { search: ["chicken", "shawarma"], category: ["Chicken"] },
    "Kafta Kebab": { search: ["kofta", "kebab"], category: ["Lamb", "Beef"] },
    "Grilled Hammour": { search: ["fish"], category: ["Seafood"] },
    // Main courses
    "Kabsa": { search: ["biryani", "rice", "chicken"], category: ["Chicken", "Lamb"] },
    "Mandi": { search: ["biryani", "lamb", "rice"], category: ["Lamb"] },
    "Machboos": { search: ["biryani", "rice"], category: ["Chicken"] },
    "Lamb Ouzi": { search: ["lamb", "biryani"], category: ["Lamb"] },
    // Desserts
    "Kunafa": { search: ["baklava", "pastry", "cake"], category: ["Dessert"] },
    "Basbousa": { search: ["cake", "pudding"], category: ["Dessert"] },
    "Um Ali": { search: ["pudding", "cake"], category: ["Dessert"] },
    // Beverages
    "Arabic Coffee": { search: ["coffee"], category: [] },
    "Mint Lemon": { search: ["lemonade", "juice"], category: [] },
    "Saudi Champagne": { search: ["juice", "lemonade"], category: [] },
    "Karak Tea": { search: ["tea", "coffee"], category: [] },
    // Breakfast
    "Ful Medames": { search: ["soup", "falafel"], category: ["Starter"] },
    "Shakshuka": { search: ["shakshuka", "eggs", "omelette"], category: ["Breakfast"] },
    "Masoub": { search: ["pudding", "cake", "pancake"], category: ["Dessert", "Breakfast"] },
    "Classic Omelette": { search: ["omelette", "eggs"], category: ["Breakfast"] },
    "Eggs Benedict": { search: ["eggs", "omelette"], category: ["Breakfast"] },
    "Orange Juice": { search: ["juice", "lemonade"], category: [] },
    "Mixed Berry Smoothie": { search: ["juice"], category: [] },
    // Catering
    "Mezza Platter (10 Persons)": { search: ["hummus", "falafel", "salad"], category: ["Starter"] },
    "Grill Platter (10 Persons)": { search: ["kebab", "shawarma", "lamb"], category: ["Lamb", "Beef"] },
    "Full Lamb Mandi": { search: ["lamb", "biryani"], category: ["Lamb"] },
    "Kunafa Tray": { search: ["baklava", "cake", "pastry"], category: ["Dessert"] },
    "Assorted Baklava Box": { search: ["baklava", "pastry", "cake"], category: ["Dessert"] },
    // Drinks
    "Saffron Latte": { search: ["coffee"], category: [] },
    "Turkish Coffee": { search: ["coffee"], category: [] },
    "Hot Chocolate": { search: ["chocolate", "coffee"], category: [] },
    "Iced Spanish Latte": { search: ["coffee"], category: [] },
    "Pistachio Milkshake": { search: ["juice"], category: ["Dessert"] },
    "Fresh Watermelon Juice": { search: ["juice", "lemonade"], category: [] },
    "Classic Mojito": { search: ["lemonade", "juice"], category: [] },
    "Passion Fruit Mojito": { search: ["juice", "lemonade"], category: [] },
    "Strawberry Mojito": { search: ["juice"], category: [] },
    // Ramadan
    "Individual Iftar Set": { search: ["biryani", "rice"], category: ["Lamb", "Chicken"] },
    "Family Iftar Set (4 Persons)": { search: ["lamb", "kebab", "biryani"], category: ["Lamb"] },
  };

  // Track used images to avoid duplicates
  const usedImages = new Set<string>();

  function pickImage(mapping: { search: string[]; category: string[] }): string | null {
    // Try search pool first
    for (const term of mapping.search) {
      const imgs = pool[term] || [];
      for (const img of imgs) {
        if (!usedImages.has(img)) {
          usedImages.add(img);
          return img;
        }
      }
    }
    // Try category pool
    for (const cat of mapping.category) {
      const imgs = categoryPool[cat] || [];
      for (const img of imgs) {
        if (!usedImages.has(img)) {
          usedImages.add(img);
          return img;
        }
      }
    }
    // Try area pool as last resort
    for (const img of areaPool) {
      if (!usedImages.has(img)) {
        usedImages.add(img);
        return img;
      }
    }
    return null;
  }

  // Get all menu items from DB
  const items = await prisma.menuItem.findMany({
    select: { id: true, name: true },
  });

  console.log(`\nAssigning photos to ${items.length} menu items...\n`);

  let updated = 0;

  for (const item of items) {
    const mapping = itemMapping[item.name] || { search: ["chicken", "lamb"], category: ["Chicken"] };
    const imageUrl = pickImage(mapping);

    if (imageUrl) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { photo: imageUrl },
      });
      console.log(`  ✓ ${item.name}`);
      updated++;
    } else {
      console.log(`  ✗ ${item.name} — no image available`);
    }
  }

  console.log(`\nDone! Updated ${updated}/${items.length} items with food photos.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
