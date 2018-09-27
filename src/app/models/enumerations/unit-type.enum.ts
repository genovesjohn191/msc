import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum UnitType {
  Kilobyte,
  Megabyte,
  Gigabyte,
  CPU
}

export const unitTypeText = {
  [UnitType.Kilobyte]: 'KB',
  [UnitType.Megabyte]: 'MB',
  [UnitType.Gigabyte]: 'GB',
  [UnitType.CPU]: 'vCPU'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsUnitTypeSerialization')
export class McsUnitTypeSerialization
  extends McsEnumSerializationBase<UnitType> {
  constructor() { super(UnitType); }
}
