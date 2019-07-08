import {
  Serializer,
  Deserializer
} from 'json-object-mapper';
import { isNullOrEmpty } from '@app/utilities';

export class McsDateSerialization implements Serializer, Deserializer {

  /**
   * Serialize the enumeration based on type provided on the enum type
   */
  public serialize(value: Date): string {
    return isNullOrEmpty(value) ? '' : '"' + value.toISOString() + '"';
  }

  /**
   * Deserialize the enumeration based on type provided on the enum type
   */
  public deserialize(value: string): Date {
    return new Date(value);
  }
}
