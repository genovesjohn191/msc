import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupGeneralStatus {
  PartialSuccess = 'Partial Success',
  Failure = 'Failure',
  Success = 'Success',
  Running = 'Running',
}

export const saasBackupGeneralStatusText = {
  [SaasBackupGeneralStatus.PartialSuccess]: 'Partial Success',
  [SaasBackupGeneralStatus.Failure]: 'Failure',
  [SaasBackupGeneralStatus.Success]: 'Success',
  [SaasBackupGeneralStatus.Running]: 'Running'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupGeneralStatusSerialization
  extends McsEnumSerializationBase<SaasBackupGeneralStatus> {
  constructor() { super(SaasBackupGeneralStatus); }
}
