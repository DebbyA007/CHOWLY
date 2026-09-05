import type { MenuView } from "@/lib/menu";

// A fixed copy of the menu, so the three superseded art directions render as the
// prototypes they are without querying the database. They are kept as evidence of the
// design process, not as part of the product, and a prototype that reads live data
// would make three static pages into three database calls for nothing.
export const SAMPLE_MENU: MenuView = {
  "restaurant": {
    "name": "The Golden Gate",
    "location": "13 Ubah Street, Berger, Lagos"
  },
  "menus": [
    {
      "id": "menu_food",
      "name": "Mains",
      "type": "FOOD",
      "items": [
        {
          "id": "item_grilled_steak",
          "name": "Grilled steak",
          "description": "Sirloin with pepper sauce and chips",
          "priceKobo": 850000,
          "price": "₦8,500",
          "prepTimeMinutes": 22,
          "photo": "/photos/item_grilled_steak.jpg",
          "available": true
        },
        {
          "id": "item_grilled_catfish",
          "name": "Grilled catfish",
          "description": "Whole, roasted plantain, pepper sauce",
          "priceKobo": 700000,
          "price": "₦7,000",
          "prepTimeMinutes": 20,
          "photo": "/photos/item_grilled_catfish.jpg",
          "available": true
        },
        {
          "id": "item_pounded_yam_egusi",
          "name": "Pounded yam and egusi",
          "description": "Goat meat and stockfish",
          "priceKobo": 550000,
          "price": "₦5,500",
          "prepTimeMinutes": 18,
          "photo": "/photos/item_pounded_yam_egusi.jpg",
          "available": true
        },
        {
          "id": "item_jollof_rice",
          "name": "Jollof rice",
          "description": "Grilled chicken and fried plantain",
          "priceKobo": 350000,
          "price": "₦3,500",
          "prepTimeMinutes": 12,
          "photo": "/photos/item_jollof_rice.jpg",
          "available": true
        },
        {
          "id": "item_eggs_benedict",
          "name": "Eggs benedict",
          "description": "Poached eggs and hollandaise",
          "priceKobo": 500000,
          "price": "₦5,000",
          "prepTimeMinutes": 10,
          "photo": "/photos/item_eggs_benedict.jpg",
          "available": true
        }
      ]
    },
    {
      "id": "menu_soups",
      "name": "Soups",
      "type": "FOOD",
      "items": [
        {
          "id": "item_goat_pepper_soup",
          "name": "Goat pepper soup",
          "description": "Hot light broth with scent leaf",
          "priceKobo": 400000,
          "price": "₦4,000",
          "prepTimeMinutes": 14,
          "photo": "/photos/item_goat_pepper_soup.jpg",
          "available": true
        }
      ]
    },
    {
      "id": "menu_drinks",
      "name": "Drinks",
      "type": "DRINKS",
      "items": [
        {
          "id": "item_chapman",
          "name": "Chapman",
          "description": "Mixed fruit cocktail with bitters",
          "priceKobo": 350000,
          "price": "₦3,500",
          "prepTimeMinutes": 4,
          "photo": "/photos/item_chapman.jpg",
          "available": true
        },
        {
          "id": "item_mojito",
          "name": "Mojito",
          "description": "Lime and mint",
          "priceKobo": 400000,
          "price": "₦4,000",
          "prepTimeMinutes": 5,
          "photo": "/photos/item_mojito.jpg",
          "available": true
        },
        {
          "id": "item_merlot_2018",
          "name": "Merlot 2018",
          "description": "French red, by the glass",
          "priceKobo": 600000,
          "price": "₦6,000",
          "prepTimeMinutes": 3,
          "photo": "/photos/item_merlot_2018.jpg",
          "available": true
        },
        {
          "id": "item_zobo",
          "name": "Zobo",
          "description": "Hibiscus with ginger",
          "priceKobo": 150000,
          "price": "₦1,500",
          "prepTimeMinutes": 4,
          "photo": "/photos/item_zobo.jpg",
          "available": true
        },
        {
          "id": "item_bottled_water",
          "name": "Bottled water",
          "description": "Still, chilled, 75cl",
          "priceKobo": 100000,
          "price": "₦1,000",
          "prepTimeMinutes": 1,
          "photo": "/photos/item_bottled_water.jpg",
          "available": true
        }
      ]
    }
  ]
};
