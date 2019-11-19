import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HidsProtectionLevel {
  Prevent = 1,
  Detect = 2
}

export class HidsProtectionLevelSerialization
  extends McsEnumSerializationBase<HidsProtectionLevelSerialization> {
  constructor() { super(HidsProtectionLevelSerialization); }
}
