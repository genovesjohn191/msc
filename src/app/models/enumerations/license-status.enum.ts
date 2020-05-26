import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum LicenseStatus {
  None = 0,
  Active,
  Pending,
  Suspended,
  Deleted
}

export const licenseStatusText = {
  [LicenseStatus.None]: 'None',
  [LicenseStatus.Active]: 'Active',
  [LicenseStatus.Pending]: 'Pending',
  [LicenseStatus.Suspended]: 'Suspended',
  [LicenseStatus.Deleted]: 'Deleted',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class LicenseStatusSerialization
  extends McsEnumSerializationBase<LicenseStatus> {
  constructor() { super(LicenseStatus); }
}
