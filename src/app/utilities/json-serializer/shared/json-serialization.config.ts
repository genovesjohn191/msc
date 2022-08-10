import { IJsonDeserializer } from './json-deserializer.interface';
import { IJsonSerializer } from './json-serializer.interface';

export interface IJsonSerializationConfig<T> {
  ignore?: boolean;
  name?: string;
  target?: new (...args: any[]) => T;
  serializer?: new (...args: any[]) => IJsonSerializer;
  deserializer?: new (...args: any[]) => IJsonDeserializer;
}

export class JsonSerializationConfig<T> implements IJsonSerializationConfig<T> {
  public ignore?: boolean;
  public name?: string;
  public target?: new (...args: any[]) => T;
  public serializer?: new (...args: any[]) => IJsonSerializer;
  public deserializer?: new (...args: any[]) => IJsonDeserializer;
}
