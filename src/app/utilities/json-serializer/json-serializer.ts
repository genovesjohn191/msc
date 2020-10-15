import { IJsonObject } from './json-deserializer';
import {
  getPropertyMetadata,
  isArray,
  isPrimitiveType
} from './json-helper';

/**
 * Serializes the target object instance to json object
 * @param targetInstance The target object instance to be serialized
 * @return Serialized JSON Object
 */
export function serialize<TEntity extends any>(targetInstance: TEntity): IJsonObject {
  if (!targetInstance) {
    throw new Error(`Cannot parse the target instance of undefined.`);
  }

  return !isArray(targetInstance) ?
    serializeObject(targetInstance) :
    (targetInstance as any).map((rawObject) => serializeObject(rawObject));
}

function serializeObject(targetInstance: any): any {
  if (typeof (targetInstance) !== 'object') { return targetInstance; }

  let jsonObject: any = {};
  Object.keys(targetInstance).forEach((propertyKey) => {
    let propertyMetadata = getPropertyMetadata(targetInstance, propertyKey);
    jsonObject[(propertyMetadata && propertyMetadata.name) || propertyKey] =
      serializeProperty(targetInstance, propertyKey);
  });
  return jsonObject;
}

function serializeProperty(targetInstance: any, propertyKey: string): any {
  let propertyValue = targetInstance[propertyKey];
  if (propertyValue === undefined || propertyValue === null) { return propertyValue; }

  let propertyMetadata = getPropertyMetadata(targetInstance, propertyKey);
  if (!propertyMetadata) { return propertyValue; }

  let hasCustomSerializer = propertyMetadata.serializer ? true : false;
  if (hasCustomSerializer) {
    let customSerializer = new propertyMetadata.serializer();
    return customSerializer && customSerializer.serialize(propertyValue);
  }

  if (isArray(propertyValue)) {
    let propertyArray = new Array(...propertyValue);
    return propertyArray.map((propItem: any) =>
      !propItem || isPrimitiveType(propItem) ? propItem : serializeObject(propItem)
    );
  }
  return serializeObject(propertyValue);
}
