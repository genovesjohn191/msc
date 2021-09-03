import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ManagementDomain {
  BackupSydIntellicentreNetAu,
  MgtSydIntellicentreNetAu
}

export const managementDomainText = {
  [ManagementDomain.BackupSydIntellicentreNetAu]: '.backup.syd.intellicentre.net.au',
  [ManagementDomain.MgtSydIntellicentreNetAu]: '.mgt.syd.intellicentre.net.au'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ManagementDomainSerialization
  extends McsEnumSerializationBase<ManagementDomain> {
  constructor() { super(ManagementDomain); }
}
