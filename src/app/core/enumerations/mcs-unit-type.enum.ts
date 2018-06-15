import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsUnitType {
  Kilobyte,
  Megabyte,
  Gigabyte,
  CPU
}

export const mcsUnitTypeText = {
  [McsUnitType.Kilobyte]: 'KB',
  [McsUnitType.Megabyte]: 'MB',
  [McsUnitType.Gigabyte]: 'GB',
  [McsUnitType.CPU]: 'vCPU'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsUnitTypeSerialization')
export class McsUnitTypeSerialization
  extends McsEnumSerializationBase<McsUnitType> {
  constructor() { super(McsUnitType); }
}
