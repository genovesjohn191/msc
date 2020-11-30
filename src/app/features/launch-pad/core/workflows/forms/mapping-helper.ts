import { McsObjectCrispElementServiceAttribute } from '@app/models';

export enum CrispAttributeNames {
  Resource = 'IC2_ACCESS',
  WindowsOperatingSystem = 'IC2_WINLIC',
  LinuxOperatingSystem = 'IC2_LINLIC',
  CpuCount = 'IC2_VCPU',
  Memory = 'IC2_VRAM',
  Storage = 'IC2_STORAGE',
  IPAddress = 'IC2_IP',
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