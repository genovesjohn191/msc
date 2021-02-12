import { McsObjectCrispElementServiceAttribute } from '@app/models';

export enum CrispAttributeNames {
  Resource = 'IC2_ACCESS',
  WindowsOperatingSystem = 'IC2_WINLIC',
  LinuxOperatingSystem = 'IC2_LINLIC',
  CpuCount = 'IC2_VCPU',
  Memory = 'IC2_VRAM',
  Storage = 'IC2_STORAGE',
  IPAddress = 'IC2_IP',
  DiskSpace = 'IC2_DISK_SPACE',
  StorageTier = 'IC2_STORAGE_TIER',
  DesignatedUsage = 'DESIGNATED_USAGE',
  Server = 'IC2_SERVER',
  ServerLink = 'SERVER_LINK',
  ServerLinkAv = 'LINK_SRV_ID_VAV',
  HidsProtectionLevel = 'HIPS_PROTECTION_LVL'
}

export const findCrispElementAttribute:
(key: CrispAttributeNames, payload: McsObjectCrispElementServiceAttribute[]) => McsObjectCrispElementServiceAttribute =
(key, payload) => {
  return payload.find((prop) => prop.code === key);
};

// TODO: Map multiple values into one result
export const findCrispElementMultiValueAttribute:
(key: CrispAttributeNames, payload: McsObjectCrispElementServiceAttribute[]) => McsObjectCrispElementServiceAttribute =
(key, payload) => {
  return {
    code: 'TODO',
    displayValue: 'TODO',
    value: ['TODO'],
  }
};