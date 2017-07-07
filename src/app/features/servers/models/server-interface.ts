export class ServerInterface {
  public name: string;
  public ipAddress: string[];
  public adminStatus: string;
  public operationStatus: string;
  public maxSpeed: string;
  public mtu: number;
  public macAddress: string;
  public isSubInterface: boolean;
  public vLanId: number;
  public vCenter: string;
  public portGroup: string;
}
