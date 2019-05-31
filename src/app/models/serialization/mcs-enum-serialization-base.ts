import {
  Serializer,
  Deserializer
} from 'json-object-mapper';

export class McsEnumSerializationBase<T> implements Serializer, Deserializer {
  constructor(protected enumType: any) { }

  /**
   * Serialize the enumeration based on type provided on the enum type
   */
  public serialize(value: T): string {
    return '"' + this.enumType[value] + '"';
  }

  /**
   * Deserialize the enumeration based on type provided on the enum type
   */
  public deserialize(value: string): T {
    return this.enumType[value];
  }
}
