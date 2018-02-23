export class ServerCompute {
  public cpuAllocation: number;
  public cpuReservation: number;
  public cpuLimit: number;
  public cpuUsed: number;
  public memoryAllocationMB: number;
  public memoryReservationMB: number;
  public memoryLimitMB: number;
  public memoryUsedMB: number;

  constructor() {
    this.cpuAllocation = undefined;
    this.cpuReservation = undefined;
    this.cpuLimit = undefined;
    this.cpuUsed = undefined;
    this.memoryAllocationMB = undefined;
    this.memoryReservationMB = undefined;
    this.memoryLimitMB = undefined;
    this.memoryUsedMB = undefined;
  }
}
