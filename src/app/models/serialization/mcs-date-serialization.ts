import {
  IJsonSerializer,
  IJsonDeserializer
} from '@peerlancers/json-serialization';
import { isNullOrEmpty } from '@app/utilities';

export class McsDateSerialization implements IJsonSerializer, IJsonDeserializer {

  /**
   * Serialize the enumeration based on type provided on the enum type
   */
  public serialize(value: Date): string {
    return isNullOrEmpty(value) ? '' : value.toISOString();
  }

  /**
   * Deserialize the enumeration based on type provided on the enum type
   */
  public deserialize(value: string): Date {
    return new Date(value);
  }
}
