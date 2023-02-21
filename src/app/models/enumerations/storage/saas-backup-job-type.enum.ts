import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupJobType {
  Exchange = 'EXCHANGE',
  SharepointTeams = 'SHAREPOINT_TEAMS',
  OneDrive = 'ONEDRIVE'
}

export const saasBackupJobTypeText = {
  [SaasBackupJobType.Exchange]: 'Exchange',
  [SaasBackupJobType.SharepointTeams]: 'SharePoint/Teams',
  [SaasBackupJobType.OneDrive]: 'OneDrive'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupJobTypeSerialization
  extends McsEnumSerializationBase<SaasBackupJobType> {
  constructor() { super(SaasBackupJobType); }
}
