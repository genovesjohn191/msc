/**
 *
 * @param letters required minimum number of letter characters
 * @param numbers required minimum number of numeric characters
 * @param specials required minimum number of special characters
 * @param either number of characters that can be any type of characters
 */
export function createRandomString(
  letters: number,
  numbers: number,
  specials: number,
  either: number): string {
    letters = letters < 0 ? 0 : letters;
    numbers = numbers < 0 ? 0 : numbers;
    specials = specials < 0 ? 0 : specials;
    either = either < 0 ? 0 : either;

    const chars = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // letters
      '0123456789', // numbers
      '~!@#$%^&*(){}[]', // special characters
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*(){}[]' // either
    ];

    return [letters, numbers, specials, either].map((len, i) => {
      return Array(len).fill(chars[i]).map((x) => {
        return x[Math.floor(Math.random() * x.length)];
      }).join('');
    }).concat().join('').split('').sort(() => {
      return 0.5 - Math.random();
    }).join('');
}

/**
 * Returns the hash of a string (NOT to be used for security purposes)
 */
export function hashString(source: string): string  {
  let seed = 0;
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < source.length; i++) {
      ch = source.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  source = 4294967296 * (2097151 & h2) + (h1>>>0).toString();

  return source;
}
