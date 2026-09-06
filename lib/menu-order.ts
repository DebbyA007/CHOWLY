// The card is printed in an order that is neither alphabetical nor by price, so the
// order lives in the database (Menu.sortOrder and MenuItem.sortOrder, delta 15) and is
// read back here. A retired dish carries sortOrder -1: it stays in the database for the
// orders that name it, and it is off the card.
export const OFF_THE_CARD = -1;

export const STAFF_ORDER = ["chef_adaeze", "chef_tunde", "chef_ngozi", "bartender_emeka", "bartender_funke", "waiter_kemi", "waiter_chidi", "waiter_amaka"];

// The dishes a licensed photograph was found for, which is now every dish on the card.
// The monogram tile stays in the code as the fallback for a dish added without one, but
// nothing on the card uses it: seeing the food on every row was worth more than the
// quality floor an earlier pass held to. The sources, licences, and the handful of
// photographs that show a similar dish rather than the exact one, are in
// docs/PHOTOGRAPHY.md.
export const PHOTOGRAPHED = new Set<string>([
  "item_akara_canapes",
  "item_beef_fillet_pepper_sauce",
  "item_beef_suya_carpaccio",
  "item_braised_beef_short_rib",
  "item_cafe_latte",
  "item_calabar_spice",
  "item_cappuccino",
  "item_cappuccino_2",
  "item_champagne_bottle",
  "item_chapman",
  "item_chapman_2",
  "item_chefs_tasting_menu",
  "item_chicken_plantain_spring_rolls",
  "item_chicken_suya_bowl",
  "item_chicken_wings",
  "item_chocolate_lava_cake",
  "item_classic_english_breakfast",
  "item_classic_lemonade",
  "item_deconstructed_moi_moi",
  "item_efo_riro_pounded_yam",
  "item_egusi_royale",
  "item_english_breakfast_tea",
  "item_english_breakfast_tea_2",
  "item_espresso",
  "item_french_toast_lagos_style",
  "item_fresh_fruit_smoothie",
  "item_fresh_ginger_tea_with_honey",
  "item_fresh_orange_juice",
  "item_fresh_orange_juice_2",
  "item_fresh_watermelon_juice",
  "item_full_nigerian_breakfast",
  "item_goat_cheese_plantain_bites",
  "item_green_tea",
  "item_grilled_lagos_sea_bass",
  "item_grilled_lobster_thermidor",
  "item_herb_crusted_lamb_rack",
  "item_hibiscus_iced_tea",
  "item_house_red_wine_glass",
  "item_house_white_wine_glass",
  "item_jollof_rice_grilled_chicken",
  "item_lagos_sunset",
  "item_lobster_pepper_soup",
  "item_mango_coconut_panna_cotta",
  "item_mango_passion_spritz",
  "item_mini_beef_burgers",
  "item_mini_beef_suya_skewers",
  "item_mini_chicken_pies",
  "item_mini_scotch_eggs",
  "item_moi_moi_poached_eggs",
  "item_naija_mule",
  "item_nigerian_breakfast_platter",
  "item_nigerian_cheesecake",
  "item_nigerian_coffee",
  "item_nigerian_coffee_2",
  "item_nigerian_pepper_crusted_salmon",
  "item_nigerian_seafood_pasta",
  "item_ofada_rice_ayamase",
  "item_oxtail_ofada_rice",
  "item_palm_wine_royale",
  "item_pancake_tropical_fruit_stack",
  "item_peppered_snail",
  "item_pineapple_ginger_juice",
  "item_pineapple_ginger_juice_2",
  "item_pineapple_mint_cooler",
  "item_plantain_creme_brulee",
  "item_plantain_prawn_bites",
  "item_prawn_avocado_salad",
  "item_prawn_cocktail_lagos",
  "item_prawn_spring_rolls",
  "item_premium_red_wine_bottle",
  "item_premium_sparkling_water",
  "item_premium_still_water",
  "item_premium_white_wine_bottle",
  "item_puff_puff_chocolate_fondant",
  "item_scallop_plantain",
  "item_seafood_okra",
  "item_smoked_fish_croquettes",
  "item_smoked_fish_crostini",
  "item_smoked_salmon_avocado_toast",
  "item_sparkling_water",
  "item_sparkling_wine_glass",
  "item_suya_beef_skewers",
  "item_tropical_fruit_platter",
  "item_tropical_mocktail",
  "item_virgin_mojito",
  "item_wagyu_beef_jollof_risotto",
  "item_whole_grilled_sea_bream",
  "item_wine_pairing",
  "item_yam_egg_royale",
  "item_zobo",
  "item_zobo_martini",
  "item_zobo_royale",
]);

export function photoFor(itemId: string): string {
  return PHOTOGRAPHED.has(itemId) ? `/photos/${itemId}.jpg` : "";
}

// Staff are listed in the order the design lists them, not by name.
export function byDesignOrder<T extends { id: string; name: string }>(rows: T[], order: string[]): T[] {
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => {
    const ra = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return ra === rb ? a.name.localeCompare(b.name) : ra - rb;
  });
}
