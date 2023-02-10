import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum PodAvailabilityZone {
  Intellicentre1 = 'Intellicentre 1',
  Intellicentre2 = 'Intellicentre 2',
  Intellicentre3 = 'Intellicentre 3',
  Intellicentre4 = 'Intellicentre 4',
  Perth = 'Perth'
}

export const podAvailabilityZoneText = {
  [PodAvailabilityZone.Intellicentre1]: 'IC1',
  [PodAvailabilityZone.Intellicentre2]: 'IC2',
  [PodAvailabilityZone.Intellicentre3]: 'IC3',
  [PodAvailabilityZone.Intellicentre4]: 'IC4',
  [PodAvailabilityZone.Perth]: 'PH1'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PodAvailabilityZoneSerialization
  extends McsEnumSerializationBase<PodAvailabilityZone> {
  constructor() { super(PodAvailabilityZone); }
}
