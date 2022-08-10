import {
  getPropertyMetadata,
  isArray,
  isObject,
  isPrimitiveType
} from './json-helper';

export interface IJsonObject {
  [key: string]: any;
}

/**
 * Deserializes the json object based on the target object instance
 * @param target The target object instance for deserialization
 * @param jsonObject Json object to be deserialized
 * @return Deserialized target object instance
 */
export function deserialize<TEntity extends IJsonObject, TResult = TEntity>(
  target: new (...args: any[]) => TEntity,
  jsonObject: IJsonObject
): TResult {
  if (!jsonObject) { return undefined as any; }
  if (typeof (jsonObject) !== 'object') { return undefined as any; }

  return !isArray(jsonObject) ?
    deserializeObject(target, jsonObject) :
    jsonObject.map((rawJson) => deserializeObject(target, rawJson));
}

function deserializeObject<T>(classObject: new() => T, jsonObject: IJsonObject): any {
  if (!classObject) { return jsonObject; }

  let targetInstance = new classObject();
  Object.keys(targetInstance).forEach((propertyKey: string) => {
    targetInstance[propertyKey] = deserializeProperty(
      targetInstance,
      propertyKey,
      jsonObject
    );
  });
  return targetInstance;
}

function deserializeProperty(targetInstance: any, propertyKey: string, jsonObject: IJsonObject): any {
  if (!jsonObject) { return undefined; }
  if (typeof (jsonObject) !== 'object') { return undefined; }

  let propertyMetadata = getPropertyMetadata<any>(targetInstance, propertyKey);
  if (!propertyMetadata || propertyMetadata.ignore) { return; }

  let jsonValue = jsonObject[propertyMetadata.name || propertyKey];

  let hasCustomDeserializer = propertyMetadata.deserializer ? true : false;
  if (hasCustomDeserializer) {
    let customDeserializer = new propertyMetadata.deserializer();
    return customDeserializer && customDeserializer.deserialize(jsonObject[propertyMetadata.name || propertyKey]);
  }

  if (isArray(jsonValue)) {
    return jsonValue.map((item: any) => isPrimitiveType(item) ?
      item : deserializeObject(propertyMetadata.target, item));
  }

  if (isObject(jsonValue)) {
    if (!propertyMetadata.target) { return new Object(jsonValue); }
    return deserializeObject(propertyMetadata.target, jsonValue);
  }
  return jsonValue;
}
