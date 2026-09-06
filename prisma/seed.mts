// Seed for CHOWLY: one restaurant, the printed menu of The Golden Gate in fourteen
// sections, and the staff a waiter picks from. Every row has a stable id and is written
// with upsert, so running the seed twice leaves the same rows in place.
//
// Prices are integer kobo (naira times 100). The three bottles the card prices as "from"
// carry priceFrom and cannot be added to an order (delta 14). Each item carries the
// station that prepares it (delta 12), which is what decides whether an order needs a
// chef, a bartender, or neither.
//
// The source menu has no preparation times. Every one of them is assigned here, from the
// bands published in the submission document, and they are spread deliberately: the
// promise a guest is shown is the longest prep time in their order, so a flat set of
// times would give every order the same promise.
//
// A dish that leaves the menu is never deleted if an order points at it. It is marked
// unavailable and kept, so that historical orders, receipts and totals still resolve.
import { MenuType, PrismaClient, Station } from "@prisma/client";

const prisma = new PrismaClient();

const restaurant = {
  id: "rest_golden_gate",
  name: "The Golden Gate",
  location: "13 Ubah Street, Berger, Lagos",
  phone: "+234 810 000 0100",
  email: "table@goldengate.example",
};

type SeedMenu = { id: string; name: string; section: string; sortOrder: number; type: MenuType };
type SeedItem = {
  id: string;
  menuId: string;
  name: string;
  description: string;
  priceKobo: number;
  prepTimeMinutes: number;
  station: Station;
  priceFrom: boolean;
  sortOrder: number;
};

const menus: SeedMenu[] = [
  { id: "menu_breakfast", name: "Food", section: "Breakfast", sortOrder: 0, type: MenuType.FOOD },
  { id: "menu_breakfast_breakfast_drinks", name: "Drinks", section: "Breakfast", sortOrder: 1, type: MenuType.DRINKS },
  { id: "menu_lunch_starters", name: "Starters", section: "Lunch", sortOrder: 2, type: MenuType.FOOD },
  { id: "menu_lunch_main_courses", name: "Mains", section: "Lunch", sortOrder: 3, type: MenuType.FOOD },
  { id: "menu_lunch_lunch_drinks", name: "Drinks", section: "Lunch", sortOrder: 4, type: MenuType.DRINKS },
  { id: "menu_dinner_fine_dining_starters", name: "Starters", section: "Dinner", sortOrder: 5, type: MenuType.FOOD },
  { id: "menu_dinner_main_courses", name: "Mains", section: "Dinner", sortOrder: 6, type: MenuType.FOOD },
  { id: "menu_finger_foods_canap_s", name: "Finger foods", section: "Finger foods", sortOrder: 7, type: MenuType.FOOD },
  { id: "menu_desserts", name: "Desserts", section: "Desserts", sortOrder: 8, type: MenuType.FOOD },
  { id: "menu_drinks_cocktails_signature_nigerian_inspired_cocktails", name: "Cocktails", section: "Drinks", sortOrder: 9, type: MenuType.DRINKS },
  { id: "menu_drinks_cocktails_wines_champagne", name: "Wines", section: "Drinks", sortOrder: 10, type: MenuType.DRINKS },
  { id: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Soft", section: "Drinks", sortOrder: 11, type: MenuType.DRINKS },
  { id: "menu_drinks_cocktails_hot_beverages", name: "Hot", section: "Drinks", sortOrder: 12, type: MenuType.DRINKS },
  { id: "menu_tasting", name: "Tasting menu", section: "Tasting menu", sortOrder: 13, type: MenuType.FOOD },
];

const items: SeedItem[] = [
  { id: "item_classic_english_breakfast", menuId: "menu_breakfast", name: "Classic English Breakfast", description: "Eggs, beef sausage, baked beans, grilled tomatoes, mushrooms, toast and butter. Eggs cooked to order; vegetables grilled and served with toasted bread.", priceKobo: 1850000, prepTimeMinutes: 18, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_nigerian_breakfast_platter", menuId: "menu_breakfast", name: "Nigerian Breakfast Platter", description: "Akara, pap, fried plantain, boiled egg and pepper sauce. Beans are blended and seasoned before frying; pap is cooked smooth and served hot.", priceKobo: 1450000, prepTimeMinutes: 20, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_yam_egg_royale", menuId: "menu_breakfast", name: "Yam & Egg Royale", description: "Fried or boiled yam with eggs, tomatoes, onions, peppers and smoked fish.", priceKobo: 1650000, prepTimeMinutes: 16, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_moi_moi_poached_eggs", menuId: "menu_breakfast", name: "Moi Moi & Poached Eggs", description: "Steamed bean pudding with poached eggs, prawns and a light pepper-tomato sauce.", priceKobo: 1750000, prepTimeMinutes: 22, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_french_toast_lagos_style", menuId: "menu_breakfast", name: "French Toast Lagos Style", description: "Brioche dipped in spiced egg custard, pan-fried and served with caramelised plantain and honey.", priceKobo: 1550000, prepTimeMinutes: 14, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_pancake_tropical_fruit_stack", menuId: "menu_breakfast", name: "Pancake & Tropical Fruit Stack", description: "Fluffy pancakes with mango, pineapple, banana, berries and honey.", priceKobo: 1600000, prepTimeMinutes: 13, station: Station.KITCHEN, priceFrom: false, sortOrder: 5 },
  { id: "item_smoked_salmon_avocado_toast", menuId: "menu_breakfast", name: "Smoked Salmon & Avocado Toast", description: "Sourdough, avocado, smoked salmon, poached egg, lemon and microgreens.", priceKobo: 2200000, prepTimeMinutes: 12, station: Station.KITCHEN, priceFrom: false, sortOrder: 6 },
  { id: "item_full_nigerian_breakfast", menuId: "menu_breakfast", name: "Full Nigerian Breakfast", description: "Yam, plantain, eggs, sausage, sautéed vegetables and house pepper sauce.", priceKobo: 2000000, prepTimeMinutes: 21, station: Station.KITCHEN, priceFrom: false, sortOrder: 7 },
  { id: "item_fresh_orange_juice", menuId: "menu_breakfast_breakfast_drinks", name: "Fresh Orange Juice", description: "Freshly squeezed oranges, served chilled.", priceKobo: 700000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 0 },
  { id: "item_pineapple_ginger_juice", menuId: "menu_breakfast_breakfast_drinks", name: "Pineapple & Ginger Juice", description: "Fresh pineapple blended with ginger and strained.", priceKobo: 650000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 1 },
  { id: "item_zobo_royale", menuId: "menu_breakfast_breakfast_drinks", name: "Zobo Royale", description: "Hibiscus, pineapple, ginger, cloves and citrus, chilled and lightly sweetened.", priceKobo: 600000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 2 },
  { id: "item_fresh_fruit_smoothie", menuId: "menu_breakfast_breakfast_drinks", name: "Fresh Fruit Smoothie", description: "Seasonal tropical fruits blended with yoghurt.", priceKobo: 800000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 3 },
  { id: "item_cappuccino", menuId: "menu_breakfast_breakfast_drinks", name: "Cappuccino", description: "Espresso with steamed milk and milk foam.", priceKobo: 750000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 4 },
  { id: "item_english_breakfast_tea", menuId: "menu_breakfast_breakfast_drinks", name: "English Breakfast Tea", description: "Black tea served with milk, lemon and honey.", priceKobo: 600000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 5 },
  { id: "item_nigerian_coffee", menuId: "menu_breakfast_breakfast_drinks", name: "Nigerian Coffee", description: "Locally sourced coffee with steamed milk.", priceKobo: 700000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 6 },
  { id: "item_peppered_snail", menuId: "menu_lunch_starters", name: "Peppered Snail", description: "Tender snail sautéed with onions, peppers and Nigerian spices.", priceKobo: 1800000, prepTimeMinutes: 16, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_prawn_avocado_salad", menuId: "menu_lunch_starters", name: "Prawn & Avocado Salad", description: "Grilled prawns, avocado, cucumber, tomatoes and mixed greens with citrus dressing.", priceKobo: 2000000, prepTimeMinutes: 11, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_suya_beef_skewers", menuId: "menu_lunch_starters", name: "Suya Beef Skewers", description: "Thinly sliced beef coated in suya spice, grilled and served with onions and tomatoes.", priceKobo: 1600000, prepTimeMinutes: 15, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_chicken_plantain_spring_rolls", menuId: "menu_lunch_starters", name: "Chicken & Plantain Spring Rolls", description: "Seasoned chicken and plantain wrapped in pastry and fried until crisp.", priceKobo: 1400000, prepTimeMinutes: 14, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_smoked_fish_croquettes", menuId: "menu_lunch_starters", name: "Smoked Fish Croquettes", description: "Smoked fish, potato and herbs formed into croquettes and fried until golden.", priceKobo: 1500000, prepTimeMinutes: 13, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_jollof_rice_grilled_chicken", menuId: "menu_lunch_main_courses", name: "Jollof Rice & Grilled Chicken", description: "Nigerian party-style jollof rice with tomato, pepper and spices, served with grilled chicken and vegetables.", priceKobo: 2500000, prepTimeMinutes: 24, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_seafood_okra", menuId: "menu_lunch_main_courses", name: "Seafood Okra", description: "Fresh prawns, calamari and fish cooked with sliced okra, peppers and aromatic spices. Served with swallow.", priceKobo: 2800000, prepTimeMinutes: 27, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_grilled_lagos_sea_bass", menuId: "menu_lunch_main_courses", name: "Grilled Lagos Sea Bass", description: "Fresh sea bass grilled with herbs, garlic and lemon; served with roasted vegetables and potatoes.", priceKobo: 3000000, prepTimeMinutes: 28, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_beef_fillet_pepper_sauce", menuId: "menu_lunch_main_courses", name: "Beef Fillet & Pepper Sauce", description: "Premium beef fillet grilled to preference and served with Nigerian pepper sauce, mashed potatoes and vegetables.", priceKobo: 3800000, prepTimeMinutes: 26, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_ofada_rice_ayamase", menuId: "menu_lunch_main_courses", name: "Ofada Rice & Ayamase", description: "Local Ofada rice served with green pepper sauce, assorted meats and boiled egg.", priceKobo: 2600000, prepTimeMinutes: 30, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_efo_riro_pounded_yam", menuId: "menu_lunch_main_courses", name: "Efo Riro & Pounded Yam", description: "Leafy vegetable stew cooked with peppers, palm oil and assorted protein, served with smooth pounded yam.", priceKobo: 2400000, prepTimeMinutes: 25, station: Station.KITCHEN, priceFrom: false, sortOrder: 5 },
  { id: "item_chicken_suya_bowl", menuId: "menu_lunch_main_courses", name: "Chicken Suya Bowl", description: "Grilled suya-spiced chicken, jollof rice, plantain, vegetables and house suya sauce.", priceKobo: 2400000, prepTimeMinutes: 22, station: Station.KITCHEN, priceFrom: false, sortOrder: 6 },
  { id: "item_nigerian_seafood_pasta", menuId: "menu_lunch_main_courses", name: "Nigerian Seafood Pasta", description: "Linguine with prawns, calamari, peppers, garlic, tomatoes and herbs.", priceKobo: 2700000, prepTimeMinutes: 23, station: Station.KITCHEN, priceFrom: false, sortOrder: 7 },
  { id: "item_chapman", menuId: "menu_lunch_lunch_drinks", name: "Chapman", description: "Grenadine, citrus juices, bitters and soda, served over ice.", priceKobo: 750000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 0 },
  { id: "item_pineapple_mint_cooler", menuId: "menu_lunch_lunch_drinks", name: "Pineapple Mint Cooler", description: "Pineapple juice, fresh mint, lime and soda.", priceKobo: 700000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 1 },
  { id: "item_mango_passion_spritz", menuId: "menu_lunch_lunch_drinks", name: "Mango Passion Spritz", description: "Mango, passion fruit, lime and sparkling water.", priceKobo: 800000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 2 },
  { id: "item_classic_lemonade", menuId: "menu_lunch_lunch_drinks", name: "Classic Lemonade", description: "Fresh lemon juice, water and light sugar syrup.", priceKobo: 600000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 3 },
  { id: "item_hibiscus_iced_tea", menuId: "menu_lunch_lunch_drinks", name: "Hibiscus Iced Tea", description: "Zobo infused with citrus and served over ice.", priceKobo: 650000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 4 },
  { id: "item_sparkling_water", menuId: "menu_lunch_lunch_drinks", name: "Sparkling Water", description: "Chilled premium sparkling water.", priceKobo: 500000, prepTimeMinutes: 1, station: Station.NONE, priceFrom: false, sortOrder: 5 },
  { id: "item_lobster_pepper_soup", menuId: "menu_dinner_fine_dining_starters", name: "Lobster Pepper Soup", description: "Lobster simmered in a fragrant broth with Nigerian pepper soup spices, herbs and aromatics.", priceKobo: 2500000, prepTimeMinutes: 22, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_scallop_plantain", menuId: "menu_dinner_fine_dining_starters", name: "Scallop & Plantain", description: "Seared scallops with caramelised plantain, chilli butter and citrus reduction.", priceKobo: 2800000, prepTimeMinutes: 18, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_beef_suya_carpaccio", menuId: "menu_dinner_fine_dining_starters", name: "Beef Suya Carpaccio", description: "Thinly sliced premium beef with suya spice, parmesan, herbs and citrus dressing.", priceKobo: 2400000, prepTimeMinutes: 12, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_prawn_cocktail_lagos", menuId: "menu_dinner_fine_dining_starters", name: "Prawn Cocktail Lagos", description: "Chilled prawns with avocado, lettuce and a mildly spiced citrus cocktail sauce.", priceKobo: 2200000, prepTimeMinutes: 10, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_deconstructed_moi_moi", menuId: "menu_dinner_fine_dining_starters", name: "Deconstructed Moi Moi", description: "Elegant interpretation of moi moi with steamed bean mousse, prawns, pepper reduction and herbs.", priceKobo: 2000000, prepTimeMinutes: 16, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_grilled_lobster_thermidor", menuId: "menu_dinner_main_courses", name: "Grilled Lobster Thermidor", description: "Lobster baked with a creamy herb sauce, cheese and aromatics; served with vegetables and potatoes.", priceKobo: 5500000, prepTimeMinutes: 40, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_wagyu_beef_jollof_risotto", menuId: "menu_dinner_main_courses", name: "Wagyu Beef & Jollof Risotto", description: "Premium beef with creamy risotto inspired by Nigerian jollof flavours and roasted vegetables.", priceKobo: 6000000, prepTimeMinutes: 34, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_herb_crusted_lamb_rack", menuId: "menu_dinner_main_courses", name: "Herb-Crusted Lamb Rack", description: "Lamb coated with herbs and breadcrumbs, roasted and served with mashed potatoes and reduction.", priceKobo: 4800000, prepTimeMinutes: 38, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_whole_grilled_sea_bream", menuId: "menu_dinner_main_courses", name: "Whole Grilled Sea Bream", description: "Fresh sea bream grilled with garlic, lemon and herbs, served with roasted vegetables.", priceKobo: 3500000, prepTimeMinutes: 32, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_nigerian_pepper_crusted_salmon", menuId: "menu_dinner_main_courses", name: "Nigerian Pepper-Crusted Salmon", description: "Salmon coated with Nigerian spices and pan-seared; served with plantain purée and seasonal vegetables.", priceKobo: 3800000, prepTimeMinutes: 26, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_braised_beef_short_rib", menuId: "menu_dinner_main_courses", name: "Braised Beef Short Rib", description: "Slow-cooked beef in aromatic sauce until tender, served with creamy mashed potatoes and vegetables.", priceKobo: 4500000, prepTimeMinutes: 45, station: Station.KITCHEN, priceFrom: false, sortOrder: 5 },
  { id: "item_egusi_royale", menuId: "menu_dinner_main_courses", name: "Egusi Royale", description: "Refined egusi sauce with premium beef and prawns, served with small portions of pounded yam.", priceKobo: 3200000, prepTimeMinutes: 30, station: Station.KITCHEN, priceFrom: false, sortOrder: 6 },
  { id: "item_oxtail_ofada_rice", menuId: "menu_dinner_main_courses", name: "Oxtail & Ofada Rice", description: "Slow-braised oxtail served with Ofada rice, roasted vegetables and rich pepper sauce.", priceKobo: 4000000, prepTimeMinutes: 42, station: Station.KITCHEN, priceFrom: false, sortOrder: 7 },
  { id: "item_mini_beef_suya_skewers", menuId: "menu_finger_foods_canap_s", name: "Mini Beef Suya Skewers", description: "Beef, suya spice, onions and peppers, grilled on skewers.", priceKobo: 1200000, prepTimeMinutes: 13, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_mini_chicken_pies", menuId: "menu_finger_foods_canap_s", name: "Mini Chicken Pies", description: "Chicken, vegetables and herbs enclosed in pastry and baked.", priceKobo: 1000000, prepTimeMinutes: 12, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_prawn_spring_rolls", menuId: "menu_finger_foods_canap_s", name: "Prawn Spring Rolls", description: "Prawns and vegetables wrapped in pastry and fried until crisp.", priceKobo: 1300000, prepTimeMinutes: 13, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_plantain_prawn_bites", menuId: "menu_finger_foods_canap_s", name: "Plantain & Prawn Bites", description: "Fried plantain topped with spiced prawns and pepper sauce.", priceKobo: 1400000, prepTimeMinutes: 11, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_mini_scotch_eggs", menuId: "menu_finger_foods_canap_s", name: "Mini Scotch Eggs", description: "Boiled eggs wrapped in seasoned minced meat and fried or baked.", priceKobo: 1100000, prepTimeMinutes: 13, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_smoked_fish_crostini", menuId: "menu_finger_foods_canap_s", name: "Smoked Fish Crostini", description: "Toasted baguette topped with smoked fish mousse and herbs.", priceKobo: 1300000, prepTimeMinutes: 9, station: Station.KITCHEN, priceFrom: false, sortOrder: 5 },
  { id: "item_goat_cheese_plantain_bites", menuId: "menu_finger_foods_canap_s", name: "Goat Cheese & Plantain Bites", description: "Caramelised plantain paired with goat cheese and honey.", priceKobo: 1200000, prepTimeMinutes: 10, station: Station.KITCHEN, priceFrom: false, sortOrder: 6 },
  { id: "item_mini_beef_burgers", menuId: "menu_finger_foods_canap_s", name: "Mini Beef Burgers", description: "Brioche, premium beef patty, cheese, lettuce and house sauce.", priceKobo: 1500000, prepTimeMinutes: 15, station: Station.KITCHEN, priceFrom: false, sortOrder: 7 },
  { id: "item_akara_canapes", menuId: "menu_finger_foods_canap_s", name: "Akara Canapés", description: "Mini bean fritters topped with pepper relish and smoked fish.", priceKobo: 1000000, prepTimeMinutes: 12, station: Station.KITCHEN, priceFrom: false, sortOrder: 8 },
  { id: "item_chicken_wings", menuId: "menu_finger_foods_canap_s", name: "Chicken Wings", description: "Marinated chicken wings grilled or fried and glazed with pepper sauce.", priceKobo: 1400000, prepTimeMinutes: 16, station: Station.KITCHEN, priceFrom: false, sortOrder: 9 },
  { id: "item_puff_puff_chocolate_fondant", menuId: "menu_desserts", name: "Puff-Puff & Chocolate Fondant", description: "Nigerian puff-puff served with warm chocolate fondant and vanilla cream.", priceKobo: 1400000, prepTimeMinutes: 14, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_plantain_creme_brulee", menuId: "menu_desserts", name: "Plantain Crème Brûlée", description: "Creamy custard infused with roasted plantain and finished with caramelised sugar.", priceKobo: 1300000, prepTimeMinutes: 12, station: Station.KITCHEN, priceFrom: false, sortOrder: 1 },
  { id: "item_mango_coconut_panna_cotta", menuId: "menu_desserts", name: "Mango & Coconut Panna Cotta", description: "Coconut cream set into a delicate panna cotta with fresh mango.", priceKobo: 1400000, prepTimeMinutes: 8, station: Station.KITCHEN, priceFrom: false, sortOrder: 2 },
  { id: "item_chocolate_lava_cake", menuId: "menu_desserts", name: "Chocolate Lava Cake", description: "Warm chocolate cake with a molten centre, served with vanilla ice cream.", priceKobo: 1500000, prepTimeMinutes: 15, station: Station.KITCHEN, priceFrom: false, sortOrder: 3 },
  { id: "item_nigerian_cheesecake", menuId: "menu_desserts", name: "Nigerian Cheesecake", description: "Cream cheesecake with a ginger-biscuit base and seasonal fruit.", priceKobo: 1400000, prepTimeMinutes: 8, station: Station.KITCHEN, priceFrom: false, sortOrder: 4 },
  { id: "item_tropical_fruit_platter", menuId: "menu_desserts", name: "Tropical Fruit Platter", description: "Mango, pineapple, watermelon, berries and other seasonal fruits.", priceKobo: 1200000, prepTimeMinutes: 9, station: Station.KITCHEN, priceFrom: false, sortOrder: 5 },
  { id: "item_lagos_sunset", menuId: "menu_drinks_cocktails_signature_nigerian_inspired_cocktails", name: "Lagos Sunset", description: "Passion fruit, orange, grenadine and premium spirit.", priceKobo: 1800000, prepTimeMinutes: 6, station: Station.BAR, priceFrom: false, sortOrder: 0 },
  { id: "item_naija_mule", menuId: "menu_drinks_cocktails_signature_nigerian_inspired_cocktails", name: "Naija Mule", description: "Ginger beer, lime, bitters and premium vodka.", priceKobo: 1800000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 1 },
  { id: "item_palm_wine_royale", menuId: "menu_drinks_cocktails_signature_nigerian_inspired_cocktails", name: "Palm Wine Royale", description: "Palm wine, citrus, sparkling wine and fresh herbs.", priceKobo: 2000000, prepTimeMinutes: 6, station: Station.BAR, priceFrom: false, sortOrder: 2 },
  { id: "item_zobo_martini", menuId: "menu_drinks_cocktails_signature_nigerian_inspired_cocktails", name: "Zobo Martini", description: "Hibiscus reduction, citrus and premium gin or vodka.", priceKobo: 1900000, prepTimeMinutes: 6, station: Station.BAR, priceFrom: false, sortOrder: 3 },
  { id: "item_calabar_spice", menuId: "menu_drinks_cocktails_signature_nigerian_inspired_cocktails", name: "Calabar Spice", description: "Pineapple, ginger, chilli and premium rum.", priceKobo: 1800000, prepTimeMinutes: 6, station: Station.BAR, priceFrom: false, sortOrder: 4 },
  { id: "item_house_red_wine_glass", menuId: "menu_drinks_cocktails_wines_champagne", name: "House Red Wine – Glass", description: "House selection, served chilled or at recommended temperature.", priceKobo: 1200000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 0 },
  { id: "item_house_white_wine_glass", menuId: "menu_drinks_cocktails_wines_champagne", name: "House White Wine – Glass", description: "House selection, served chilled.", priceKobo: 1200000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 1 },
  { id: "item_premium_red_wine_bottle", menuId: "menu_drinks_cocktails_wines_champagne", name: "Premium Red Wine – Bottle", description: "Curated premium bottle selection.", priceKobo: 7500000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: true, sortOrder: 2 },
  { id: "item_premium_white_wine_bottle", menuId: "menu_drinks_cocktails_wines_champagne", name: "Premium White Wine – Bottle", description: "Curated premium bottle selection.", priceKobo: 7000000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: true, sortOrder: 3 },
  { id: "item_champagne_bottle", menuId: "menu_drinks_cocktails_wines_champagne", name: "Champagne – Bottle", description: "Premium champagne selection.", priceKobo: 15000000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: true, sortOrder: 4 },
  { id: "item_sparkling_wine_glass", menuId: "menu_drinks_cocktails_wines_champagne", name: "Sparkling Wine – Glass", description: "Chilled sparkling wine.", priceKobo: 1500000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 5 },
  { id: "item_fresh_orange_juice_2", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Fresh Orange Juice", description: "Freshly squeezed and chilled.", priceKobo: 700000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 0 },
  { id: "item_fresh_watermelon_juice", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Fresh Watermelon Juice", description: "Fresh watermelon blended and strained.", priceKobo: 650000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 1 },
  { id: "item_pineapple_ginger_juice_2", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Pineapple & Ginger Juice", description: "Fresh pineapple and ginger.", priceKobo: 650000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 2 },
  { id: "item_zobo", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Zobo", description: "Hibiscus drink infused with spices and citrus.", priceKobo: 600000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 3 },
  { id: "item_chapman_2", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Chapman", description: "Grenadine, citrus, bitters and soda.", priceKobo: 750000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 4 },
  { id: "item_virgin_mojito", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Virgin Mojito", description: "Lime, mint, sugar and soda.", priceKobo: 800000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 5 },
  { id: "item_tropical_mocktail", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Tropical Mocktail", description: "Seasonal tropical fruit blend and citrus.", priceKobo: 800000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 6 },
  { id: "item_premium_still_water", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Premium Still Water", description: "Chilled premium bottled water.", priceKobo: 450000, prepTimeMinutes: 1, station: Station.NONE, priceFrom: false, sortOrder: 7 },
  { id: "item_premium_sparkling_water", menuId: "menu_drinks_cocktails_non_alcoholic_drinks", name: "Premium Sparkling Water", description: "Chilled premium sparkling water.", priceKobo: 500000, prepTimeMinutes: 1, station: Station.NONE, priceFrom: false, sortOrder: 8 },
  { id: "item_espresso", menuId: "menu_drinks_cocktails_hot_beverages", name: "Espresso", description: "Single espresso shot.", priceKobo: 600000, prepTimeMinutes: 3, station: Station.BAR, priceFrom: false, sortOrder: 0 },
  { id: "item_cappuccino_2", menuId: "menu_drinks_cocktails_hot_beverages", name: "Cappuccino", description: "Espresso with steamed milk and milk foam.", priceKobo: 750000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 1 },
  { id: "item_cafe_latte", menuId: "menu_drinks_cocktails_hot_beverages", name: "Café Latte", description: "Espresso with steamed milk.", priceKobo: 750000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 2 },
  { id: "item_english_breakfast_tea_2", menuId: "menu_drinks_cocktails_hot_beverages", name: "English Breakfast Tea", description: "Black tea with milk, lemon and honey.", priceKobo: 600000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 3 },
  { id: "item_green_tea", menuId: "menu_drinks_cocktails_hot_beverages", name: "Green Tea", description: "Premium green tea served hot.", priceKobo: 600000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 4 },
  { id: "item_nigerian_coffee_2", menuId: "menu_drinks_cocktails_hot_beverages", name: "Nigerian Coffee", description: "Locally sourced coffee with steamed milk.", priceKobo: 700000, prepTimeMinutes: 4, station: Station.BAR, priceFrom: false, sortOrder: 5 },
  { id: "item_fresh_ginger_tea_with_honey", menuId: "menu_drinks_cocktails_hot_beverages", name: "Fresh Ginger Tea with Honey", description: "Fresh ginger infusion served with honey.", priceKobo: 650000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 6 },
  { id: "item_chefs_tasting_menu", menuId: "menu_tasting", name: "Chef's Tasting Menu", description: "Eight courses: akara crisp with smoked fish mousse; prawn, avocado and citrus salad; lobster pepper soup; zobo and ginger granita; pepper-crusted salmon with plantain puree; mini Ofada rice with Ayamase; plantain creme brulee; chin-chin and chocolate truffles. Per person.", priceKobo: 8500000, prepTimeMinutes: 90, station: Station.KITCHEN, priceFrom: false, sortOrder: 0 },
  { id: "item_wine_pairing", menuId: "menu_tasting", name: "Wine Pairing", description: "The cellar’s pairing with the tasting menu, a glass with each course. Per person.", priceKobo: 5500000, prepTimeMinutes: 5, station: Station.BAR, priceFrom: false, sortOrder: 1 },
];

const chefs = [
  { id: "chef_adaeze", name: "Emeka Obi", specialty: "Grill", experience: "9 years" },
  { id: "chef_tunde", name: "Tunde Bello", specialty: "Soups and swallow", experience: "12 years" },
  { id: "chef_ngozi", name: "Amaka Nwosu", specialty: "Rice and breakfast", experience: "6 years" },
];

const bartenders = [
  { id: "bartender_emeka", name: "Ify Chukwu", specialty: "Cocktails", shift: "Evening" },
  { id: "bartender_funke", name: "Sade Balogun", specialty: "Wine", shift: "Day" },
];

const waiters = [
  { id: "waiter_kemi", name: "Ada Okafor", phone: "+234 810 000 0101", shift: "Evening" },
  { id: "waiter_chidi", name: "Chidi Obi", phone: "+234 810 000 0102", shift: "Evening" },
  { id: "waiter_amaka", name: "Amaka Nwachukwu", phone: "+234 810 000 0103", shift: "Day" },
];

const retiredBartenders = ["bartender_ibrahim"];

async function main() {
  const { id: restaurantId, ...restaurantData } = restaurant;
  await prisma.restaurant.upsert({ where: { id: restaurantId }, update: restaurantData, create: { id: restaurantId, ...restaurantData } });

  for (const { id, ...data } of menus) {
    await prisma.menu.upsert({ where: { id }, update: { ...data, restaurantId }, create: { id, ...data, restaurantId } });
  }
  for (const { id, ...data } of items) {
    await prisma.menuItem.upsert({ where: { id }, update: { ...data, available: true }, create: { id, ...data } });
  }

  // Everything that was on the card before and is not on it now. An item an order names
  // is retired in place, because deleting it would break that order's lines, its receipt
  // and its total. An item nobody ever ordered can go.
  const keep = new Set(items.map((i) => i.id));
  const stale = await prisma.menuItem.findMany({ where: { id: { notIn: [...keep] } }, select: { id: true, name: true } });
  const retired: string[] = [];
  const removed: string[] = [];
  for (const item of stale) {
    const ordered = await prisma.orderItem.count({ where: { menuItemId: item.id } });
    if (ordered > 0) {
      await prisma.menuItem.update({ where: { id: item.id }, data: { available: false } });
      retired.push(item.name);
    } else {
      await prisma.menuItem.delete({ where: { id: item.id } });
      removed.push(item.name);
    }
  }
  // A menu with nothing left on it goes too, unless a retired item still sits there.
  const menuIds = new Set(menus.map((m) => m.id));
  for (const menu of await prisma.menu.findMany({ where: { id: { notIn: [...menuIds] } }, include: { _count: { select: { items: true } } } })) {
    if (menu._count.items === 0) await prisma.menu.delete({ where: { id: menu.id } });
  }

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
    menus: await prisma.menu.count(),
    onTheCard: await prisma.menuItem.count({ where: { available: true } }),
    retiredKeptForOldOrders: retired.length,
    deletedNeverOrdered: removed.length,
    kitchen: await prisma.menuItem.count({ where: { station: "KITCHEN", available: true } }),
    bar: await prisma.menuItem.count({ where: { station: "BAR", available: true } }),
    neither: await prisma.menuItem.count({ where: { station: "NONE", available: true } }),
    priceOnRequest: await prisma.menuItem.count({ where: { priceFrom: true } }),
    chefs: await prisma.chef.count(),
    bartenders: await prisma.bartender.count(),
    waiters: await prisma.waiter.count(),
  };
  console.log("Seeded. Row counts:", JSON.stringify(counts));
  if (retired.length) console.log("Retired, kept because an order names them:", retired.join(", "));
  if (removed.length) console.log("Deleted, never ordered:", removed.join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
