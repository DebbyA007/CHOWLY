// The quiz, as static content and a draw with no repeats. Nothing is generated and
// nothing is fetched: the questions ship with the application, so the game works whatever
// the connection is doing and no request leaves the phone to play it.
//
// The mix is deliberate for a restaurant table: Lagos and Nigeria, food and cooking, and
// general knowledge, sixteen each. Everything is light and answerable, and nothing here
// touches politics, religion or anything else that could land badly at a family dinner.
export type Topic = "Lagos and Nigeria" | "Food and cooking" | "General knowledge";

export type Question = {
  id: string;
  topic: Topic;
  ask: string;
  options: readonly string[];
  answer: number;
};

const q = (id: string, topic: Topic, ask: string, options: string[], answer: number): Question => ({ id, topic, ask, options, answer });

export const QUESTIONS: readonly Question[] = Object.freeze([
  // Lagos and Nigeria
  q("ng01", "Lagos and Nigeria", "Which ocean lies to the south of Lagos?", ["The Atlantic", "The Indian", "The Pacific", "The Arctic"], 0),
  q("ng02", "Lagos and Nigeria", "Which city became Nigeria's capital in 1991?", ["Abuja", "Kano", "Ibadan", "Enugu"], 0),
  q("ng03", "Lagos and Nigeria", "What is Nigeria's currency called?", ["The naira", "The cedi", "The shilling", "The franc"], 0),
  q("ng04", "Lagos and Nigeria", "Which bridge is the long one linking Lagos Island to the mainland?", ["Third Mainland Bridge", "Carter Bridge", "Eko Bridge", "Falomo Bridge"], 0),
  q("ng05", "Lagos and Nigeria", "What colour are the two outer bands of the Nigerian flag?", ["Green", "Blue", "Red", "Yellow"], 0),
  q("ng06", "Lagos and Nigeria", "Which country lies directly west of Nigeria?", ["Benin", "Chad", "Cameroon", "Niger"], 0),
  q("ng07", "Lagos and Nigeria", "Nigeria takes its name from which river?", ["The Niger", "The Benue", "The Congo", "The Volta"], 0),
  q("ng08", "Lagos and Nigeria", "Nollywood is the film industry of which country?", ["Nigeria", "Ghana", "Kenya", "South Africa"], 0),
  q("ng09", "Lagos and Nigeria", "Who wrote the novel Things Fall Apart?", ["Chinua Achebe", "Wole Soyinka", "Ben Okri", "Cyprian Ekwensi"], 0),
  q("ng10", "Lagos and Nigeria", "Zuma Rock stands near which city?", ["Abuja", "Lagos", "Jos", "Calabar"], 0),
  q("ng11", "Lagos and Nigeria", "What are Nigeria's national football team called?", ["The Super Eagles", "The Black Stars", "The Lions", "The Elephants"], 0),
  q("ng12", "Lagos and Nigeria", "Which is Nigeria's largest city by population?", ["Lagos", "Abuja", "Kano", "Port Harcourt"], 0),
  q("ng13", "Lagos and Nigeria", "In Yoruba, how do you say good morning?", ["E kaaro", "E kaasan", "E kaale", "O daaro"], 0),
  q("ng14", "Lagos and Nigeria", "Afrobeats grew out of the music scene of which country?", ["Nigeria", "Jamaica", "Brazil", "Senegal"], 0),
  q("ng15", "Lagos and Nigeria", "How many states does Nigeria have?", ["36", "24", "30", "42"], 0),
  q("ng16", "Lagos and Nigeria", "Lekki and Ikoyi are neighbourhoods of which city?", ["Lagos", "Abuja", "Ibadan", "Benin City"], 0),

  // Food and cooking
  q("fd01", "Food and cooking", "What gives jollof rice most of its colour?", ["Tomatoes and peppers", "Turmeric", "Palm oil", "Beetroot"], 0),
  q("fd02", "Food and cooking", "Egusi soup is thickened with the seeds of which plant?", ["Melon", "Sunflower", "Sesame", "Pumpkin"], 0),
  q("fd03", "Food and cooking", "Akara is made mainly from what?", ["Beans", "Rice", "Yam", "Maize"], 0),
  q("fd04", "Food and cooking", "Moi moi is cooked by which method?", ["Steaming", "Grilling", "Roasting", "Frying"], 0),
  q("fd05", "Food and cooking", "Zobo is made from which flower?", ["Hibiscus", "Rose", "Lavender", "Jasmine"], 0),
  q("fd06", "Food and cooking", "Fried plantain is popularly called what?", ["Dodo", "Suya", "Gari", "Kuli kuli"], 0),
  q("fd07", "Food and cooking", "Garri is made from which root?", ["Cassava", "Potato", "Ginger", "Carrot"], 0),
  q("fd08", "Food and cooking", "Suya is seasoned with a peanut spice blend called what?", ["Yaji", "Berbere", "Ras el hanout", "Garam masala"], 0),
  q("fd09", "Food and cooking", "Palm wine is tapped from what?", ["A palm tree", "A vine", "A cactus", "A gourd"], 0),
  q("fd10", "Food and cooking", "Puff puff is cooked how?", ["Deep fried", "Baked", "Steamed", "Grilled"], 0),
  q("fd11", "Food and cooking", "Efo riro is a stew built mainly on what?", ["Leafy vegetables", "Beans", "Rice", "Yam"], 0),
  q("fd12", "Food and cooking", "Which of these is eaten as a swallow?", ["Pounded yam", "Pepper soup", "Chin chin", "Zobo"], 0),
  q("fd13", "Food and cooking", "Which nut is offered as a sign of welcome in parts of Nigeria?", ["Kola nut", "Cashew", "Almond", "Walnut"], 0),
  q("fd14", "Food and cooking", "Ofada rice is known for being what?", ["Locally grown and aromatic", "Imported and polished", "Instant", "Sweetened"], 0),
  q("fd15", "Food and cooking", "Which of these is a drink rather than a dish?", ["Chapman", "Moi moi", "Akara", "Suya"], 0),
  q("fd16", "Food and cooking", "What is the main ingredient of chin chin?", ["Flour", "Beans", "Rice", "Cassava"], 0),

  // General knowledge
  q("gk01", "General knowledge", "How many sides does a hexagon have?", ["Six", "Five", "Seven", "Eight"], 0),
  q("gk02", "General knowledge", "Which planet is known as the red planet?", ["Mars", "Venus", "Jupiter", "Saturn"], 0),
  q("gk03", "General knowledge", "What is the largest ocean on Earth?", ["The Pacific", "The Atlantic", "The Indian", "The Arctic"], 0),
  q("gk04", "General knowledge", "How many players from one team are on the pitch in football?", ["Eleven", "Nine", "Ten", "Twelve"], 0),
  q("gk05", "General knowledge", "Which is the tallest mountain in Africa?", ["Kilimanjaro", "Mount Kenya", "The Atlas", "Table Mountain"], 0),
  q("gk06", "General knowledge", "Which is the longest river in Africa?", ["The Nile", "The Niger", "The Congo", "The Zambezi"], 0),
  q("gk07", "General knowledge", "Mixing blue and yellow paint gives you what?", ["Green", "Purple", "Orange", "Brown"], 0),
  q("gk08", "General knowledge", "How many continents are there?", ["Seven", "Five", "Six", "Eight"], 0),
  q("gk09", "General knowledge", "What is the capital of Ghana?", ["Accra", "Kumasi", "Lome", "Abidjan"], 0),
  q("gk10", "General knowledge", "How many strings does a standard guitar have?", ["Six", "Four", "Five", "Seven"], 0),
  q("gk11", "General knowledge", "What is the largest land animal?", ["The elephant", "The rhino", "The giraffe", "The hippo"], 0),
  q("gk12", "General knowledge", "How many days are in a leap year?", ["366", "365", "364", "367"], 0),
  q("gk13", "General knowledge", "Which is the smallest planet in our solar system?", ["Mercury", "Mars", "Venus", "Pluto"], 0),
  q("gk14", "General knowledge", "How many degrees are in a right angle?", ["90", "45", "180", "360"], 0),
  q("gk15", "General knowledge", "What does the www in a web address stand for?", ["World Wide Web", "World Web Work", "Wide World Web", "Web World Wide"], 0),
  q("gk16", "General knowledge", "How many minutes are in two and a half hours?", ["150", "120", "140", "160"], 0),
]);

export const TOPICS: readonly Topic[] = Object.freeze(["Lagos and Nigeria", "Food and cooking", "General knowledge"]);

export function countByTopic(): Record<Topic, number> {
  const counts = { "Lagos and Nigeria": 0, "Food and cooking": 0, "General knowledge": 0 } as Record<Topic, number>;
  for (const question of QUESTIONS) counts[question.topic] += 1;
  return counts;
}

// A sitting draws from the whole set without repeating, and the options are shuffled too,
// so the right answer is not always in the same place. It takes its randomness as an
// argument, which is what lets the tests pin the behaviour rather than hope for it.
export type Asked = { question: Question; options: readonly string[]; answer: number };

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function drawSitting(random: () => number = Math.random): Asked[] {
  return shuffle(QUESTIONS, random).map((question) => {
    const order = shuffle(question.options.map((_, i) => i), random);
    return {
      question,
      options: order.map((i) => question.options[i]!),
      answer: order.indexOf(question.answer),
    };
  });
}
