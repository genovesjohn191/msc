import 'reflect-metadata';
import {
  IJsonSerializationConfig,
  JsonSerializationConfig
} from './shared';

/**
 * A property decorator for serialization
 * @param config Configuration of the target property for serialization
 * @summary By default, if the config is not provided, the name
 * of the property will be used, and it is considered as primitive type object.
 */
export function JsonProperty<T>(config?: IJsonSerializationConfig<T>):
  (_target: any, _name: string) => void {
  let decoratorMetadata = new JsonSerializationConfig();
  if (config) { decoratorMetadata = config; }
  return Reflect.metadata('JsonProperty', decoratorMetadata);
}
