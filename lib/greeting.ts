// The greeting on the menu, by the hour.
//
// Two rules it follows. There is no login, so the app knows nothing about who is holding
// the phone: no honorific and no title, because "sir" or "ma" would be a coin flip on a
// stranger. And the hour is the guest's own, read from their device in the browser, not
// the server's: Vercel serves this from wherever it likes, and a guest in Lagos should
// not be told good evening because a machine in Frankfurt thinks so.
export type Greeting = { hello: string; ask: string };

export function greetingFor(hour: number): Greeting {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new RangeError(`hour must be an integer from 0 to 23, received ${hour}`);
  }
  if (hour >= 5 && hour < 12) return { hello: "Good morning.", ask: "What would you like this morning?" };
  if (hour >= 12 && hour < 17) return { hello: "Good afternoon.", ask: "What would you like this afternoon?" };
  return { hello: "Good evening.", ask: "What would you like tonight?" };
}
