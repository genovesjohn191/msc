import {
  IJsonDeserializer,
  IJsonSerializer
} from '@app/utilities';

export class McsIdSerialization implements IJsonSerializer, IJsonDeserializer {
  public serialize(value: string): string {
    return value?.toString();
  }

  public deserialize(value: string | number): string {
    return value?.toString();
  }
}
