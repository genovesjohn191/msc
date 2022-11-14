import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupType {
  M365 = 'M365'
}

export const saasBackupTypeText = {
  [SaasBackupType.M365]: 'Microsoft 356'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupTypeSerialization
  extends McsEnumSerializationBase<SaasBackupType> {
  constructor() { super(SaasBackupType); }
}
