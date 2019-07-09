import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AvailabilityZone {
  Unknown = 0,
  IC1,
  IC2,
  IC3,
  IC4
}

export const availabilityZoneText = {
  [AvailabilityZone.Unknown]: 'Unknown',
  [AvailabilityZone.IC1]: 'IC1',
  [AvailabilityZone.IC2]: 'IC2',
  [AvailabilityZone.IC3]: 'IC3',
  [AvailabilityZone.IC4]: 'IC4'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('AvailabilityZoneSerialization')
export class AvailabilityZoneSerialization
  extends McsEnumSerializationBase<AvailabilityZone> {
  constructor() { super(AvailabilityZone); }
}
