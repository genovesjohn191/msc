import {
  Serializer,
  Deserializer
} from 'json-object-mapper';
import { getEnumString } from '../../../utilities';

export class McsEnumSerializationBase<T> implements Serializer, Deserializer {
  constructor(protected enumType: any) { }

  /**
   * Serialize the enumeration based on type provided on the enum type
   */
  public serialize(value: T): string {
    return getEnumString(this.enumType, value);
  }

  /**
   * Deserialize the enumeration based on type provided on the enum type
   */
  public deserialize(value: string) {
    return this.enumType[value];
  }
}
