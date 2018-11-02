import Hashids from 'hashids';
import { convertSpacesToDash } from '@app/utilities';

const DEFAULT_HASH_LENGTH = 8;
const DEFAULT_ID_MAX_LENGTH = 25;
const DEFAULT_TEXT_PREFIX = '@innertext';

// Unique Id that generates during runtime
let nextUniqueId = 0;

export class McsUniqueId {

  public static hashInstance = new Hashids('', DEFAULT_HASH_LENGTH);

  /**
   * Generates new id and put the innertext inside of the generated id
   */
  public static NewId(innerText?: string): string {
    let uniqueEncodedId = this.hashInstance.encode(nextUniqueId++);
    let convertedInnertext = convertSpacesToDash(innerText || uniqueEncodedId);
    convertedInnertext = convertedInnertext.substring(0,
      Math.min(convertedInnertext.length, DEFAULT_ID_MAX_LENGTH)
    );
    return `${uniqueEncodedId}[${DEFAULT_TEXT_PREFIX}=${convertedInnertext}]`;
  }
}
