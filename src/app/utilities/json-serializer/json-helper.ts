import 'reflect-metadata';
import { JsonSerializationConfig } from './shared';

export function isObject(target: any): boolean {
  if (target === undefined || target === null) { return false; }
  return typeof target === 'object';
}

export function isArray(target: any): boolean {
  if (target === undefined || target === null) { return false; }
  if (target === Array) { return true; }

  return Object.prototype.toString.call(target) === '[object Array]';
}

export function isPrimitiveType(target: any): boolean {
  if (target === undefined || target === null) { return false; }
  return !!(['string', 'boolean', 'number']
    .indexOf((typeof target)) > -1 || (target instanceof String || target === String ||
      target instanceof Number || target === Number ||
      target instanceof Boolean || target === Boolean));
}

export function getPropertyMetadata<T>(target: any, propertyKey: string): JsonSerializationConfig<T> {
  return Reflect.getMetadata('JsonProperty', target, propertyKey);
}
