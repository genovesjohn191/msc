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
