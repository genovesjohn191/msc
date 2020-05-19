import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum BatLinkedServiceStatus {
  TransitionProvisioning
}

export const batLinkedServiceStatusText = {
  [BatLinkedServiceStatus.TransitionProvisioning]: 'Transition/Provisioning'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class BatLinkedServiceStatusSerialization
  extends McsEnumSerializationBase<BatLinkedServiceStatus> {
  constructor() { super(BatLinkedServiceStatus); }
}
