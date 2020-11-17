import { McsObjectCrispElementServiceAttribute } from '@app/models';

export interface LaunchPadPayloadConverter<T> {
  convert(attributes: T): { key: string, value: any }[];
}

class newVirtualMachinePayloadConverter implements LaunchPadPayloadConverter<McsObjectCrispElementServiceAttribute[]> {
  public convert(payload: McsObjectCrispElementServiceAttribute[]): { key: string; value: any; }[] {
    let mappedProperties: { key: string, value: any }[] = [];

    mappedProperties.push({ key: 'resource', value: payload.find((prop) => prop.code === 'IC2_ACCESS')?.displayValue } );
    mappedProperties.push({ key: 'cpuCount', value: payload.find((prop) => prop.code === 'IC2_VCPU')?.value } );
    mappedProperties.push({ key: 'memoryInGB', value: payload.find((prop) => prop.code === 'IC2_VRAM')?.value } );
    mappedProperties.push({ key: 'storageSizeInGB', value: payload.find((prop) => prop.code === 'IC2_STORAGE')?.value } );
    let ipAddress = payload.find((prop) => prop.code === 'IC2_IP')?.value;
    mappedProperties.push({ key: 'ipAddress', value: ipAddress } );
    mappedProperties.push({ key: 'ipAllocationMode', value: ipAddress ? 'Manual' : 'Dhcp' } );

    return mappedProperties;
  }
}
