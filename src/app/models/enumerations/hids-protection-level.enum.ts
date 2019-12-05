import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HidsProtectionLevel {
  Protect = 1,
  Detect
}

export class HidsProtectionLevelSerialization
  extends McsEnumSerializationBase<HidsProtectionLevel> {
  constructor() { super(HidsProtectionLevel); }
}
