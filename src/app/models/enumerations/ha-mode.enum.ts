import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HaMode {
  Unknown,
  Standalone,
  ActivePassive,
  ActiveActive,
  Elbc,
  Dual,
  Enabled
}

/**
 * Enumeration serializer and deserializer methods
 */
export class HaModeSerialization
  extends McsEnumSerializationBase<HaMode> {
  constructor() { super(HaMode); }
}
