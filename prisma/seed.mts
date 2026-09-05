// Seed for CHOWLY: one restaurant, three menus (Mains, Soups, Drinks), the eleven dishes
// of the Night Service handoff, and the staff a waiter picks from. Every row has a
// stable id and is written with upsert, so running the seed twice leaves the same rows
// in place. Dishes that left the menu are kept but marked unavailable, because old
// orders still point at them.
//
// Prices are integer kobo (naira times 100). Prep times are the kitchen's own and the
// promised wait is the longest of them.
import { MenuType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const restaurant = {
  id: "rest_golden_gate",
  name: "The Golden Gate",
  location: "13 Ubah Street, Berger, Lagos",
  phone: "+234 810 000 0100",
  email: "table@goldengate.example",
};

// menu_food keeps its id from the first seed so its items stay attached; it is Mains now.
const menus = [
  { id: "menu_food", name: "Mains", type: MenuType.FOOD },
  { id: "menu_soups", name: "Soups", type: MenuType.FOOD },
  { id: "menu_drinks", name: "Drinks", type: MenuType.DRINKS },
];

type SeedItem = {
  id: string;
  menuId: string;
  name: string;
  description: string;
  priceKobo: number;
  prepTimeMinutes: number;
};

const items: SeedItem[] = [
  { id: "item_grilled_steak", menuId: "menu_food", name: "Grilled steak", description: "Sirloin with pepper sauce and chips", priceKobo: 850000, prepTimeMinutes: 22 },
  { id: "item_grilled_catfish", menuId: "menu_food", name: "Grilled catfish", description: "Whole, roasted plantain, pepper sauce", priceKobo: 700000, prepTimeMinutes: 20 },
  { id: "item_pounded_yam_egusi", menuId: "menu_food", name: "Pounded yam and egusi", description: "Goat meat and stockfish", priceKobo: 550000, prepTimeMinutes: 18 },
  { id: "item_jollof_rice", menuId: "menu_food", name: "Jollof rice", description: "Grilled chicken and fried plantain", priceKobo: 350000, prepTimeMinutes: 12 },
  { id: "item_eggs_benedict", menuId: "menu_food", name: "Eggs benedict", description: "Poached eggs and hollandaise", priceKobo: 500000, prepTimeMinutes: 10 },
  { id: "item_goat_pepper_soup", menuId: "menu_soups", name: "Goat pepper soup", description: "Hot light broth with scent leaf", priceKobo: 400000, prepTimeMinutes: 14 },
  { id: "item_chapman", menuId: "menu_drinks", name: "Chapman", description: "Mixed fruit cocktail with bitters", priceKobo: 350000, prepTimeMinutes: 4 },
  { id: "item_mojito", menuId: "menu_drinks", name: "Mojito", description: "Lime and mint", priceKobo: 400000, prepTimeMinutes: 5 },
  { id: "item_merlot_2018", menuId: "menu_drinks", name: "Merlot 2018", description: "French red, by the glass", priceKobo: 600000, prepTimeMinutes: 3 },
  { id: "item_zobo", menuId: "menu_drinks", name: "Zobo", description: "Hibiscus with ginger", priceKobo: 150000, prepTimeMinutes: 4 },
  { id: "item_bottled_water", menuId: "menu_drinks", name: "Bottled water", description: "Still, chilled, 75cl", priceKobo: 100000, prepTimeMinutes: 1 },
];

// On the first menu, not on this one. Old orders reference them, so they stay as rows.
const retired = ["item_suya_platter", "item_puff_puff", "item_palm_wine", "item_chilled_malt"];

const chefs = [
  { id: "chef_adaeze", name: "Emeka Obi", specialty: "Grill", experience: "9 years" },
  { id: "chef_tunde", name: "Tunde Bello", specialty: "Soups and swallow", experience: "12 years" },
  { id: "chef_ngozi", name: "Amaka Nwosu", specialty: "Rice and breakfast", experience: "6 years" },
];

const bartenders = [
  { id: "bartender_emeka", name: "Ify Chukwu", specialty: "Cocktails", shift: "Evening" },
  { id: "bartender_funke", name: "Sade Balogun", specialty: "Wine", shift: "Day" },
];
const retiredBartenders = ["bartender_ibrahim"];

const waiters = [
  { id: "waiter_kemi", name: "Ada Okafor", phone: "+234 810 000 0101", shift: "Evening" },
  { id: "waiter_chidi", name: "Chidi Obi", phone: "+234 810 000 0102", shift: "Evening" },
  { id: "waiter_amaka", name: "Amaka Nwachukwu", phone: "+234 810 000 0103", shift: "Day" },
];

async function main() {
  const { id: restaurantId, ...restaurantData } = restaurant;
  await prisma.restaurant.upsert({ where: { id: restaurantId }, update: restaurantData, create: { id: restaurantId, ...restaurantData } });

  for (const { id, ...data } of menus) {
    await prisma.menu.upsert({ where: { id }, update: { ...data, restaurantId }, create: { id, ...data, restaurantId } });
  }
  for (const { id, ...data } of items) {
    await prisma.menuItem.upsert({ where: { id }, update: { ...data, available: true }, create: { id, ...data } });
  }
  await prisma.menuItem.updateMany({ where: { id: { in: retired } }, data: { available: false } });

  for (const { id, ...data } of chefs) {
    await prisma.chef.upsert({ where: { id }, update: { ...data, restaurantId }, create: { id, ...data, restaurantId } });
  }
  for (const { id, ...data } of bartenders) {
    await prisma.bartender.upsert({ where: { id }, update: { ...data, restaurantId }, create: { id, ...data, restaurantId } });
  }
  // A bartender no order has ever named can go; one that has been named stays.
  for (const id of retiredBartenders) {
    const named = await prisma.order.count({ where: { bartenderId: id } });
    if (named === 0) await prisma.bartender.deleteMany({ where: { id } });
  }
  for (const { id, ...data } of waiters) {
    await prisma.waiter.upsert({ where: { id }, update: { ...data, restaurantId }, create: { id, ...data, restaurantId } });
  }

  const counts = {
    restaurants: await prisma.restaurant.count(),
    menus: await prisma.menu.count(),
    items: await prisma.menuItem.count({ where: { available: true } }),
    retired: await prisma.menuItem.count({ where: { available: false } }),
    chefs: await prisma.chef.count(),
    bartenders: await prisma.bartender.count(),
    waiters: await prisma.waiter.count(),
  };
  console.log("Seeded. Row counts:", JSON.stringify(counts));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
