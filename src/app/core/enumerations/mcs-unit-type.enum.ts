import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';
import { CacheKey } from 'json-object-mapper';

export enum McsUnitType {
  Megabyte,
  Gigabyte,
  CPU
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('McsUnitTypeSerialization')
export class McsUnitTypeSerialization
  extends McsEnumSerializationBase<McsUnitType> {
  constructor() { super(McsUnitType); }
}