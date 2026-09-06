# Photography

**Every one of the ninety two dishes on the card carries a photograph.** The monogram
tile that stood in for fifty of them is retired from the card: seeing the food on every
row is worth more than the quality floor an earlier pass held to, and a weaker photograph
of the actual dish beats a struck initial. The tile code stays as the fallback for a dish
added later without one, and nothing on the card uses it.

## What was relaxed, and what was not

**Relaxed: how good the photograph has to be.** The earlier rule was that a candidate had
to clearly beat the tile at 76 pixels, which threw out fifty dishes. That rule is gone.
A photograph that is dim, busy or ordinary now ships, because the row it fills is better
for having the food on it.

**Not relaxed: the licence.** CC0, public domain or CC BY only. No share-alike, nothing
unlicensed, nothing scraped from a site that did not offer it. Every image below names
its source page, its author and its licence, and the whole set is:

- 31 CC0
- 49 CC BY 2.0
- 5 CC BY 4.0
- 3 CC BY 3.0
- 4 public domain

**Not relaxed: the subject.** A photograph still has to show the dish or a fair likeness
of it. Wrong subjects were rejected the same as before, and the earlier passes produced
plenty: an engraving of a lobster for lobster pepper soup, a black and white portrait for
the tasting menu, a nude torso for a mango spritz, two sports bottles for still water, a
porcelain vase for white wine, and, for suya, six photographs of a concert, because a band
shares the name.

**Where the closest honest match is a similar dish rather than the exact one, the Note
column says so.** Thirty two rows carry such a note. They are there so a reader can tell
at a glance which photographs are the dish and which are its nearest available relative:
Akara frying in the pan stands for the Nigerian Breakfast Platter, poached eggs stand for
Moi Moi and Poached Eggs, and fried plantain stands for the two plantain canapés whose
other half is not in frame. Nothing here claims to be a photograph of The Golden Gate's
own cooking, because the restaurant is a coursework fiction.

## The treatment

Every photograph is served from this repository under `public/photos/`, because the app's
Content Security Policy allows images from its own origin only. Each was downloaded from
the source below and cropped square and centre-weighted by the browser. One CSS treatment
sits over all ninety two so they read as one shoot rather than ninety two unrelated
pictures: `sepia(0.24) saturate(0.58) contrast(0.98) brightness(0.5)`, applied in
`components/night/photo.tsx` and nowhere else.

## On the card

| Dish | Section | Source | Author | Licence | Note |
|---|---|---|---|---|---|
| Cappuccino | Breakfast, drinks | [Flickr, via Openverse](https://www.flickr.com/photos/63234672@N04/50544608617) | Mustang Joe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| English Breakfast Tea | Breakfast, drinks | [Openverse](https://stocksnap.io/photo/coffee-cup-2WTD0XFFSD) | Ylanite Koppens | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | A cup of black tea. |
| Fresh Fruit Smoothie | Breakfast, drinks | [Flickr, via Openverse](https://stocksnap.io/photo/fruits-fruit-PMO15UWZ3S) | Daria Nepriakhina | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Fresh Orange Juice | Breakfast, drinks | [Openverse](https://www.flickr.com/photos/159630537@N08/28877750758) | Homedust | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Nigerian Coffee | Breakfast, drinks | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ACappuccino_with_latte_art_on_Coffee_Right_in_Brno%2C_Brno-City_District.jpg) | Frettie | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |  |
| Pineapple & Ginger Juice | Breakfast, drinks | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFruit_drink.jpg) | Unknown photographer | Public domain |  |
| Zobo Royale | Breakfast, drinks | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=186815307) | Fatimah Bello | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | The same zobo the Zobo row shows: one photograph, two listings of the drink. |
| Classic English Breakfast | Breakfast, food | [Flickr, via Openverse](https://www.rawpixel.com/image/5927933/photo-image-public-domain-coffee-food) | unknown | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| French Toast Lagos Style | Breakfast, food | [Openverse](https://www.flickr.com/photos/7633518@N08/52334322374) | sarahstierch | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Full Nigerian Breakfast | Breakfast, food | [Openverse](https://www.flickr.com/photos/32870650@N08/4044398952) | Dana Moos | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A cooked breakfast plate with egg. |
| Moi Moi & Poached Eggs | Breakfast, food | [Openverse](https://www.flickr.com/photos/34948727@N00/8076681251) | ultrakml | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Poached eggs on a breakfast plate. The moi moi half of the dish is not in frame. |
| Nigerian Breakfast Platter | Breakfast, food | [Openverse](https://www.flickr.com/photos/60179301@N00/9326511095) | Ben Sutherland | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Akara being served from the pan. Akara is the platter's main component; the pap, plantain and egg are not in frame. |
| Pancake & Tropical Fruit Stack | Breakfast, food | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFruit_Pancakes_%2845112010972%29.jpg) | Theo Crazzolara | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Smoked Salmon & Avocado Toast | Breakfast, food | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AAvocado_%26_Smoked_Salmon_On_Sourdough_Toast_-_Amo_2026-02-04.jpg) | Andy Li | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Yam & Egg Royale | Breakfast, food | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFried_Yam_with_Egg_Sauce.jpg) | Salma kyari | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Chocolate Lava Cake | Desserts | [Openverse](https://www.flickr.com/photos/7633518@N08/55004427430) | sarahstierch | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Mango & Coconut Panna Cotta | Desserts | [Flickr, via Openverse](https://www.flickr.com/photos/115225894@N07/53504312144) | ccnull.de Bilddatenbank | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Nigerian Cheesecake | Desserts | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ACheesecake_slice_%28Los_Angeles%29_July_2023.jpg) | Benoît Prieur | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Plantain Crème Brûlée | Desserts | [Flickr, via Openverse](https://www.flickr.com/photos/140675148@N05/51634613637) | Blue Beret | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Puff-Puff & Chocolate Fondant | Desserts | [Openverse](https://www.flickr.com/photos/22693495@N02/15227929047) | veganLazySmurf | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Fried dough of the puff-puff family rather than puff-puff itself. |
| Tropical Fruit Platter | Desserts | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFruit_Platter-_Seasonal_Fruits.jpg) | روتانا | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |  |
| Braised Beef Short Rib | Dinner, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AShortribs_%282119666059%29.jpg) | Jeremy Noble from St. Paul, United States | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Braised beef in its sauce. |
| Egusi Royale | Dinner, mains | [Openverse](https://commons.wikimedia.org/w/index.php?curid=182948149) | Micheal chidubem | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Grilled Lobster Thermidor | Dinner, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ALobster_Thermidor_entree.jpg) | thefoodplace.co.uk | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Herb-Crusted Lamb Rack | Dinner, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ARack_of_Lamb.jpg) | HarshLight | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Nigerian Pepper-Crusted Salmon | Dinner, mains | [Flickr, via Openverse](https://www.flickr.com/photos/58301516@N00/52346827156) | David Jackmanson | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Oxtail & Ofada Rice | Dinner, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ASlow_Cooker_Oxtail_Stew_with_Mashed_Potatoes_and_Brussels_Sprouts_-_7_4_2019_%2847562493681%29.jpg) | CharmaineZoe's Marvelous Melange from England | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Stewed beef with rice. |
| Wagyu Beef & Jollof Risotto | Dinner, mains | [Openverse](https://www.flickr.com/photos/7633518@N08/54481626793) | sarahstierch | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Sliced steak plated. The jollof risotto is not in frame. |
| Whole Grilled Sea Bream | Dinner, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3APlated_grilled_fish.jpg) | pompi | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Beef Suya Carpaccio | Dinner, starters | [Flickr, via Openverse](https://www.flickr.com/photos/7633518@N08/51718019667) | sarahstierch | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Deconstructed Moi Moi | Dinner, starters | [Openverse](https://commons.wikimedia.org/w/index.php?curid=186326539) | Mukandas Zainab | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Lobster Pepper Soup | Dinner, starters | [Flickr, via Openverse](https://www.rawpixel.com/image/5970129/lobster-soup) | unknown | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Prawn Cocktail Lagos | Dinner, starters | [Flickr, via Openverse](https://www.flickr.com/photos/7633518@N08/54282550654) | sarahstierch | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Scallop & Plantain | Dinner, starters | [Flickr, via Openverse](https://www.flickr.com/photos/25802865@N08/54450329263) | chooyutshing | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Calabar Spice | Drinks, cocktails | [Flickr, via Openverse](https://www.flickr.com/photos/31027007@N08/31702187896) | Wine Dharma | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Lagos Sunset | Drinks, cocktails | [Openverse](https://www.flickr.com/photos/115225894@N07/53951861092) | ccnull.de Bilddatenbank | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A layered cocktail of the same build. |
| Naija Mule | Drinks, cocktails | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AMoscow_Mule_%28In_Explore_04-27-17%29_-_Flickr_-_vwcampin.jpg) | Shelby L. Bell from Omaha, NE, US | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Palm Wine Royale | Drinks, cocktails | [Openverse](https://www.flickr.com/photos/184934270@N04/52263877533) | bloggeratlarge | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | A glass of palm wine. |
| Zobo Martini | Drinks, cocktails | [Flickr, via Openverse](https://www.flickr.com/photos/94953676@N00/147709277) | jessicafm | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Café Latte | Drinks, hot | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ATwo_Hands_Cafe_latte_art_%28Unsplash%29.jpg) | Drew Coffman drewcoffman | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Cappuccino | Drinks, hot | [Flickr, via Openverse](https://www.flickr.com/photos/63234672@N04/50544608617) | Mustang Joe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | The same cappuccino as the Breakfast listing: one photograph, two listings of the drink. |
| English Breakfast Tea | Drinks, hot | [Openverse](https://stocksnap.io/photo/coffee-cup-2WTD0XFFSD) | Ylanite Koppens | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | The same tea as the Breakfast listing. |
| Espresso | Drinks, hot | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AEspresso_Coffee_01.jpg) | Jubair1985 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Fresh Ginger Tea with Honey | Drinks, hot | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AA_Cup_Of_Ginger_Tea.jpg) | ওয়ালিদ ভূইয়া | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Green Tea | Drinks, hot | [Flickr, via Openverse](https://www.flickr.com/photos/146149831@N02/47277629582) | Ludvigem | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Nigerian Coffee | Drinks, hot | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ACappuccino_with_latte_art_on_Coffee_Right_in_Brno%2C_Brno-City_District.jpg) | Frettie | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | The same Nigerian coffee as the Breakfast listing. |
| Chapman | Drinks, soft | [Flickr](https://www.flickr.com/photos/63669472@N00/2627562660) | Eugene Eric Kim (eekim) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | The same Chapman as the Lunch listing. |
| Fresh Orange Juice | Drinks, soft | [Openverse](https://www.flickr.com/photos/159630537@N08/28877750758) | Homedust | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | The same orange juice as the Breakfast listing. |
| Fresh Watermelon Juice | Drinks, soft | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3A20160812-AMS-LSC-0169_%2828963014995%29.jpg) | U.S. Department of Agriculture

Lance Cheung/Multimedia PhotoJournalist | Public domain |  |
| Pineapple & Ginger Juice | Drinks, soft | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFruit_drink.jpg) | Unknown photographer | Public domain | The same pineapple and ginger juice as the Breakfast listing. |
| Premium Sparkling Water | Drinks, soft | [Openverse](https://www.flickr.com/photos/202780880@N02/54558594935) | nenad53 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A glass being filled with sparkling water. |
| Premium Still Water | Drinks, soft | [Openverse](https://www.flickr.com/photos/26344495@N05/51334313179) | Ivan Radic | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A glass of still water. |
| Tropical Mocktail | Drinks, soft | [Flickr, via Openverse](https://www.flickr.com/photos/7831824@N04/52543074734) | Bex.Walton | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Virgin Mojito | Drinks, soft | [Flickr, via Openverse](https://www.flickr.com/photos/31027007@N08/31702187896) | Wine Dharma | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Zobo | Drinks, soft | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=186815307) | Fatimah Bello | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Champagne – Bottle | Drinks, wines | [Flickr, via Openverse](https://www.rawpixel.com/image/5966595/champagne-bottle-glass) | unknown | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| House Red Wine – Glass | Drinks, wines | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AGlass_of_Red_Wine_with_a_bottle_of_Red_Wine_-_Evan_Swigart.jpg) | Evan Swigart from Chicago, USA | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| House White Wine – Glass | Drinks, wines | [Openverse](https://www.flickr.com/photos/7633518@N08/52332281206) | sarahstierch | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Premium Red Wine – Bottle | Drinks, wines | [Flickr, via Openverse](https://www.flickr.com/photos/11121785@N00/18601257664) | Tracy Hunter | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Premium White Wine – Bottle | Drinks, wines | [Openverse](https://www.rawpixel.com/image/5914690/image-background-christmas-public-domain) | unknown | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Sparkling Wine – Glass | Drinks, wines | [Openverse](https://www.flickr.com/photos/7633518@N08/53039310807) | sarahstierch | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Akara Canapés | Finger foods | [Openverse](https://commons.wikimedia.org/w/index.php?curid=1749368) | José Oliveira (flickr user) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Akara frying in the pan. |
| Chicken Wings | Finger foods | [Flickr, via Openverse](https://www.flickr.com/photos/37165469@N00/14379321879) | Leonid Mamchenkov | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Goat Cheese & Plantain Bites | Finger foods | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ADodo_fried.jpg) | Setor33 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Fried plantain rounds. The goat cheese is not in frame. |
| Mini Beef Burgers | Finger foods | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AA_party_tray_of_sliders_at_a_restaurant.jpg) | Prayitno / Thank you for (8 millions +) views from Los Angeles, USA | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Mini Beef Suya Skewers | Finger foods | [Openverse](https://www.flickr.com/photos/55482518@N00/827408387) | usabin | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Suya skewers over the coals rather than plated. |
| Mini Chicken Pies | Finger foods | [Openverse](https://www.flickr.com/photos/38142119@N00/51946487525) | The Marmot | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Small savoury pastries on a plate. |
| Mini Scotch Eggs | Finger foods | [Flickr, via Openverse](https://www.flickr.com/photos/7633518@N08/52651430306) | sarahstierch | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Plantain & Prawn Bites | Finger foods | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ASuyawithriceplaintains.JPG) | WhisperToMe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Fried plantain on a plate. The prawns are not in frame. |
| Prawn Spring Rolls | Finger foods | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ASpring_rolls_in_Thailand..jpg) | Douglas Perkins | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |  |
| Smoked Fish Crostini | Finger foods | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ACrostini_Toscani.jpg) | Schellack at English Wikipedia | Public domain |  |
| Chapman | Lunch, drinks | [Flickr](https://www.flickr.com/photos/63669472@N00/2627562660) | Eugene Eric Kim (eekim) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Classic Lemonade | Lunch, drinks | [Flickr, via Openverse](https://www.flickr.com/photos/159630537@N08/42033707304) | Homedust | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Hibiscus Iced Tea | Lunch, drinks | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AGlass_of_iced_tea_-_Evan_Swigart.jpg) | Evan Swigart from Chicago, USA | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Mango Passion Spritz | Lunch, drinks | [Openverse](https://www.flickr.com/photos/7633518@N08/52030259368) | sarahstierch | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A spritz served long. |
| Pineapple Mint Cooler | Lunch, drinks | [Flickr, via Openverse](https://stocksnap.io/photo/summer-cocktail-HGO20PXZVV) | Tim Sullivan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Sparkling Water | Lunch, drinks | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ASparkling_Water_with_Mint_in_Glass_Cup.jpg) | Tony Webster | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A tall glass of sparkling water. |
| Beef Fillet & Pepper Sauce | Lunch, mains | [Flickr, via Openverse](https://www.flickr.com/photos/194291384@N08/51618222294) | britishhamper | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Chicken Suya Bowl | Lunch, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ASour_cream_hen_house_bowl_marinated_grilled_chicken_rice_bowl_fried_egg%2C_Chinese_broccoli%2C_sour_cream_sambal%2C_Thai_basil%2C_toasted_sesame%2C_red_jalapeno_%2826834348412%29.jpg) | T.Tseng | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | A grilled chicken bowl. |
| Efo Riro & Pounded Yam | Lunch, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AIyan_%26_Efo-Riro_%287370530836%29.jpg) | Shardayyy | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Grilled Lagos Sea Bass | Lunch, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFillet_Mignon_%26_Grilled_Herb_Sea_Bass_Fillet_%288695069823%29.jpg) | Prayitno / Thank you for (12 millions +) view from Los Angeles, USA | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Jollof Rice & Grilled Chicken | Lunch, mains | [Openverse](https://www.flickr.com/photos/41984492@N00/5958580405) | sshreeves | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Nigerian Seafood Pasta | Lunch, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ANoyo_River_Grill_-_March_2024_-_Sarah_Stierch_01.jpg) | Missvain | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |  |
| Ofada Rice & Ayamase | Lunch, mains | [Openverse](https://commons.wikimedia.org/w/index.php?curid=163674477) | Yemi festus | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Ofada rice served on leaves, as it traditionally is. The ayamase sauce is not in frame. |
| Seafood Okra | Lunch, mains | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFresh_okra_soup.jpg) | Akum20 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Chicken & Plantain Spring Rolls | Lunch, starters | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFried_Spring_Rolls_%2854538849838%29.jpg) | Choo Yut Shing | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |  |
| Peppered Snail | Lunch, starters | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3APepper_snail.jpg) | Iwai-Dialax | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Chopped snail cooked in pepper sauce. |
| Prawn & Avocado Salad | Lunch, starters | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AGreen_goddess_salad_with_chilli_prawns%2C_apple%2C_avocado%2C_cucumber%2C_edamame%2C_candied_walnut%2C_etc._-_Wellington%2C_New_Zealand.jpg) | Daderot | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Smoked Fish Croquettes | Lunch, starters | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3AFishcake_Pesto_Salad.JPG) | Benreis | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | Croquettes on a plate. |
| Suya Beef Skewers | Lunch, starters | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File%3ASuyavarietiesTX.JPG) | WhisperToMe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |  |
| Chef's Tasting Menu | Tasting menu | [Openverse](https://www.flickr.com/photos/91873384@N04/54229126407) | dalecruse | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | One plated fine-dining course, standing for the eight the menu lists. |
| Wine Pairing | Tasting menu | [Openverse](https://stocksnap.io/photo/wine-tasting-T8FNYMYTHK) | Kelly Ishmael | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Bottles and glasses set out for a tasting. |

## The landing photograph

| File | Shows | Source | Author | Licence |
|---|---|---|---|---|
| `room.jpg` | The dining room on the landing | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Restaurant_at_dusk_(Unsplash).jpg) | Patryk Sobczak, via Unsplash | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |

## Off the card, kept for the archived prototypes

Nine photographs from the first eleven dish card stay in the repository. Their dishes were
retired when the menu was replaced, so no live screen shows them; the three superseded art
directions at `/directions` still do, from a frozen copy of that menu.

| File | Shows | Source | Author | Licence |
|---|---|---|---|---|
| `item_grilled_steak.jpg` | Grilled steak | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Steak_frites_at_The_Bar_at_MacArthur_Place_in_Sonoma_-_Sarah_Stierch.jpg) | Sarah Stierch (Missvain) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `item_grilled_catfish.jpg` | Grilled catfish | [Flickr](https://www.flickr.com/photos/41984492@N00/5947418082) | sshreeves | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `item_pounded_yam_egusi.jpg` | Pounded yam and egusi | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=172656282) | Ourlibrary | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `item_jollof_rice.jpg` | Jollof rice | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=187314370) | Fatimah Bello | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `item_eggs_benedict.jpg` | Eggs benedict | [Flickr](https://www.flickr.com/photos/34948727@N00/8076681251) | ultrakml | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `item_goat_pepper_soup.jpg` | Goat pepper soup | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Spicy_Goat_meat_pepper_soup.jpg) | Halima Waziri | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `item_mojito.jpg` | Mojito | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Mojito_made_with_rum,_lime,_sugar,_mint,_club_soda,_served_in_a_tall_glass_-_Evan_Swigart.jpg) | Evan Swigart | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `item_merlot_2018.jpg` | Merlot 2018 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Wine_glass_with_red_wine_(1).jpg) | Paolo Neo | Public domain |
| `item_bottled_water.jpg` | Bottled water | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bottle_of_Water.jpg) | Jiafei Slay Queen | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |

The goat pepper soup photograph is the one share-alike image in the repository, and it is
off the card. No screen a guest can reach serves it; only the archived prototypes do, and
it stays attributed here.

## How they were found

Four passes, and each one taught the next something.

1. **Wikimedia Commons, first result that passed a licence and size check.** Sixty one
   downloads. Searching an encyclopedia by dish name returns what an encyclopedia has,
   which is engravings and portraits.
2. **Openverse, which indexes Flickr, three candidates per dish.** A hundred and four
   downloads. Real food photography, and the pass that produced most of the first
   forty two.
3. **Both sources, six candidates per dish, English menu name and Nigerian name.** Two
   hundred and eight downloads. Searching "efo riro" and "leafy vegetable stew" returns
   different pictures, and the Nigerian name is usually the better one.
4. **A targeted pass for the dishes the third produced nothing usable for**, on the
   Nigerian name alone: Moi moi, Egusi, Akara, Suya, Ofada, Zobo, Jollof. Sixty five
   downloads, and the pass that finished the card. Moi moi steamed in its leaves, egusi
   beside a ball of swallow, akara straight out of the pan, ofada rice served on leaves:
   none of those came back for the English descriptions.

Six drinks are listed twice on the card, on two different menus. Each pair shares one
photograph, which is noted on both rows.
