export class ServerNetwork {
  public id: string;
  public name: string;
  public serviceId: string;
  public vlanId: number;
  public netmask: string;
  public gateway: string;
  public ipAddresses: string[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.serviceId = undefined;
    this.vlanId = undefined;
    this.netmask = undefined;
    this.gateway = undefined;
    this.ipAddresses = undefined;
  }
}
