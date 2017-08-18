export class ServerIpAddress {
  public customIpAddress: string;
  public ipAllocationMode: 'Static' | 'Dhcp' | 'Pool';
  public valid: boolean;
}
