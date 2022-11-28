import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HaMode {
  Standalone,
  ActivePassive,
  ActiveActive,
  Elbc,
  Dual,
  Enabled,
  ColdStandby,
  Primary
}

export const haModeText = {
  [HaMode.Standalone]: 'Standalone',
  [HaMode.ActivePassive]: 'Active-Passive',
  [HaMode.ActiveActive]: 'Active-Active',
  [HaMode.Elbc]: 'ELBC',
  [HaMode.Dual]: 'Dual',
  [HaMode.Enabled]: 'Enabled',
  [HaMode.ColdStandby]: 'Cold Standby',
  [HaMode.Primary]: 'Primary'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class HaModeSerialization
  extends McsEnumSerializationBase<HaMode> {
  constructor() { super(HaMode); }
}
