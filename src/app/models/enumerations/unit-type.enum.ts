import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
