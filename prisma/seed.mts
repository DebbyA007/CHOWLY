// Seed for CHOWLY: one restaurant, a food menu and a drinks menu, and the staff a waiter
// picks from. Every row has a stable id and is written with upsert, so running the seed
// twice leaves the same rows in place instead of duplicating them.
//
// Prices are integer kobo (naira times 100). The six coursework items keep their naira
// prices; the rest fit the same Lagos kitchen. Prep times are deliberately spread from a
// poured drink at 4 minutes to a grilled cut at 22, because the wait time is computed
// from them and needs visible range.
import { MenuType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const restaurant = {
  id: "rest_golden_gate",
  name: "The Golden Gate",
  location: "13 Ubah Street, Berger, Lagos",
  phone: "+234 810 000 0100",
  email: "table@goldengate.example",
};

const menus = [
  { id: "menu_food", name: "Kitchen", type: MenuType.FOOD },
  { id: "menu_drinks", name: "Bar", type: MenuType.DRINKS },
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
  { id: "item_grilled_steak", menuId: "menu_food", name: "Grilled steak", description: "Sirloin, flame grilled, with pepper sauce and chips.", priceKobo: 850000, prepTimeMinutes: 22 },
  { id: "item_grilled_catfish", menuId: "menu_food", name: "Grilled catfish", description: "Whole catfish off the grill with roasted plantain and pepper sauce.", priceKobo: 700000, prepTimeMinutes: 20 },
  { id: "item_pounded_yam_egusi", menuId: "menu_food", name: "Pounded yam and egusi", description: "Egusi cooked with goat meat and stockfish, pounded yam on the side.", priceKobo: 550000, prepTimeMinutes: 18 },
  { id: "item_suya_platter", menuId: "menu_food", name: "Suya platter", description: "Thin cut beef in yaji spice with onions and tomato.", priceKobo: 450000, prepTimeMinutes: 15 },
  { id: "item_goat_pepper_soup", menuId: "menu_food", name: "Goat pepper soup", description: "Goat meat in a hot, light broth with scent leaf.", priceKobo: 400000, prepTimeMinutes: 14 },
  { id: "item_jollof_rice", menuId: "menu_food", name: "Jollof rice", description: "Party jollof with grilled chicken and fried plantain.", priceKobo: 350000, prepTimeMinutes: 12 },
  { id: "item_eggs_benedict", menuId: "menu_food", name: "Eggs Benedict", description: "Poached eggs and hollandaise on toasted agege bread.", priceKobo: 500000, prepTimeMinutes: 10 },
  { id: "item_puff_puff", menuId: "menu_food", name: "Puff puff", description: "Six, fried to order and dusted with sugar.", priceKobo: 150000, prepTimeMinutes: 8 },
  { id: "item_mojito", menuId: "menu_drinks", name: "Mojito", description: "White rum, lime, mint and soda, built over ice.", priceKobo: 400000, prepTimeMinutes: 6 },
  { id: "item_chapman", menuId: "menu_drinks", name: "Chapman", description: "Fanta, Sprite, grenadine and bitters over ice with cucumber.", priceKobo: 350000, prepTimeMinutes: 5 },
  { id: "item_palm_wine", menuId: "menu_drinks", name: "Palm wine", description: "Fresh tapped and served chilled in a calabash cup.", priceKobo: 250000, prepTimeMinutes: 5 },
  { id: "item_merlot_2018", menuId: "menu_drinks", name: "Merlot 2018", description: "A glass, poured at the table.", priceKobo: 600000, prepTimeMinutes: 4 },
  { id: "item_zobo", menuId: "menu_drinks", name: "Zobo", description: "Hibiscus, ginger and pineapple, served cold.", priceKobo: 150000, prepTimeMinutes: 4 },
  { id: "item_chilled_malt", menuId: "menu_drinks", name: "Chilled malt", description: "A bottle from the fridge, opened at the table.", priceKobo: 120000, prepTimeMinutes: 4 },
];

// Three of each, all on this one restaurant, so the waiter's pick lists have real choices.
const chefs = [
  { id: "chef_adaeze", name: "Adaeze Okonkwo", specialty: "Grill", experience: "9 years" },
  { id: "chef_tunde", name: "Tunde Bakare", specialty: "Soups and swallow", experience: "12 years" },
  { id: "chef_ngozi", name: "Ngozi Eze", specialty: "Rice and breakfast", experience: "6 years" },
];

const bartenders = [
  { id: "bartender_emeka", name: "Emeka Nwosu", specialty: "Cocktails", shift: "Evening" },
  { id: "bartender_funke", name: "Funke Adeyemi", specialty: "Wine", shift: "Day" },
  { id: "bartender_ibrahim", name: "Ibrahim Musa", specialty: "Soft drinks and zobo", shift: "Evening" },
];

const waiters = [
  { id: "waiter_kemi", name: "Kemi Alabi", phone: "+234 810 000 0101", shift: "Day" },
  { id: "waiter_chidi", name: "Chidi Obi", phone: "+234 810 000 0102", shift: "Evening" },
  { id: "waiter_amaka", name: "Amaka Nwachukwu", phone: "+234 810 000 0103", shift: "Day" },
];

async function main() {
  const { id: restaurantId, ...restaurantData } = restaurant;
  await prisma.restaurant.upsert({
    where: { id: restaurantId },
    update: restaurantData,
    create: { id: restaurantId, ...restaurantData },
  });

  for (const { id, ...data } of menus) {
    await prisma.menu.upsert({
      where: { id },
      update: { ...data, restaurantId },
      create: { id, ...data, restaurantId },
    });
  }

  for (const { id, ...data } of items) {
    await prisma.menuItem.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  for (const { id, ...data } of chefs) {
    await prisma.chef.upsert({
      where: { id },
      update: { ...data, restaurantId },
      create: { id, ...data, restaurantId },
    });
  }

  for (const { id, ...data } of bartenders) {
    await prisma.bartender.upsert({
      where: { id },
      update: { ...data, restaurantId },
      create: { id, ...data, restaurantId },
    });
  }

  for (const { id, ...data } of waiters) {
    await prisma.waiter.upsert({
      where: { id },
      update: { ...data, restaurantId },
      create: { id, ...data, restaurantId },
    });
  }

  const counts = {
    restaurants: await prisma.restaurant.count(),
    menus: await prisma.menu.count(),
    items: await prisma.menuItem.count(),
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
