// The card is printed in an order that is neither alphabetical nor by price, so the
// order lives in the database (Menu.sortOrder and MenuItem.sortOrder, delta 15) and is
// read back here. A retired dish carries sortOrder -1: it stays in the database for the
// orders that name it, and it is off the card.
export const OFF_THE_CARD = -1;

export const STAFF_ORDER = ["chef_adaeze", "chef_tunde", "chef_ngozi", "bartender_emeka", "bartender_funke", "waiter_kemi", "waiter_chidi", "waiter_amaka"];

// The dishes a licensed photograph was found for. Everything else takes the monogram
// tile, which is a deliberate second treatment, not a missing image: a photograph that
// does not read at 76 pixels is worse than a struck initial. The sources and licences
// are in docs/PHOTOGRAPHY.md.
export const PHOTOGRAPHED = new Set<string>([
  "item_beef_fillet_pepper_sauce",
  "item_beef_suya_carpaccio",
  "item_cafe_latte",
  "item_calabar_spice",
  "item_cappuccino",
  "item_champagne_bottle",
  "item_chapman",
  "item_chicken_plantain_spring_rolls",
  "item_chicken_wings",
  "item_classic_english_breakfast",
  "item_classic_lemonade",
  "item_espresso",
  "item_fresh_fruit_smoothie",
  "item_fresh_ginger_tea_with_honey",
  "item_fresh_watermelon_juice",
  "item_green_tea",
  "item_hibiscus_iced_tea",
  "item_house_red_wine_glass",
  "item_lobster_pepper_soup",
  "item_mango_coconut_panna_cotta",
  "item_mini_beef_burgers",
  "item_mini_scotch_eggs",
  "item_naija_mule",
  "item_nigerian_cheesecake",
  "item_nigerian_coffee",
  "item_nigerian_pepper_crusted_salmon",
  "item_nigerian_seafood_pasta",
  "item_pancake_tropical_fruit_stack",
  "item_pineapple_mint_cooler",
  "item_plantain_creme_brulee",
  "item_prawn_avocado_salad",
  "item_prawn_cocktail_lagos",
  "item_prawn_spring_rolls",
  "item_premium_red_wine_bottle",
  "item_scallop_plantain",
  "item_smoked_fish_crostini",
  "item_smoked_salmon_avocado_toast",
  "item_tropical_fruit_platter",
  "item_tropical_mocktail",
  "item_virgin_mojito",
  "item_zobo",
  "item_zobo_martini",
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
