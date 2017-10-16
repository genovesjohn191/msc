export class ServerIpAddress {
  public customIpAddress: string;
  public ipAllocationMode: 'Dhcp' | 'Pool' | 'Manual' | 'None';
  public valid: boolean;
}
