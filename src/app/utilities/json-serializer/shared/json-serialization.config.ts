import { IJsonSerializer } from './json-serializer.interface';
import { IJsonDeserializer } from './json-deserializer.interface';

export interface IJsonSerializationConfig<T> {
  name?: string;
  target?: new (...args: any[]) => T;
  serializer?: new (...args: any[]) => IJsonSerializer;
  deserializer?: new (...args: any[]) => IJsonDeserializer;
}

export class JsonSerializationConfig<T> implements IJsonSerializationConfig<T> {
  public name?: string;
  public target?: new (...args: any[]) => T;
  public serializer?: new (...args: any[]) => IJsonSerializer;
  public deserializer?: new (...args: any[]) => IJsonDeserializer;
}
