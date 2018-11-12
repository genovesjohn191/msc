import { McsServerCreate } from './mcs-server-create';
import { McsServerClone } from './mcs-server-clone';

/**
 * TODO: This is only temporary since we need to use the
 * same model of self managed to managed server in order
 * to maintain consistency in portal.
 */
export class McsOrderCreateServer {

  public static createInstanceBySelfManaged(
    selfManaged: McsServerCreate | McsServerClone
  ): McsOrderCreateServer {
    let orderDetails = new McsOrderCreateServer();

    if (selfManaged instanceof McsServerCreate) {
      orderDetails.cpuCount = selfManaged.cpuCount;
      orderDetails.memoryMB = selfManaged.memoryMB;
      orderDetails.name = selfManaged.name;
      orderDetails.network = {
        name: selfManaged.network.name,
        ipAllocationMode: selfManaged.network.name,
        ipAddress: selfManaged.network.ipAddress ? selfManaged.network.ipAddress : ''
      };
      orderDetails.os = selfManaged.image;
      orderDetails.platform = selfManaged.platform;
      orderDetails.resource = selfManaged.resource;
      orderDetails.storage = {
        name: selfManaged.storage.name,
        storageMB: selfManaged.storage.sizeMB
      };
    } else {
      orderDetails.name = selfManaged.name;
    }
    return orderDetails;
  }

  public platform: string;
  public resource: string;
  public name: string;
  public cpuCount: number;
  public memoryMB: number;
  public os: string;
  public template: string;

  public storage: {
    name: string,
    storageMB: number
  };

  public network: {
    name: string,
    ipAllocationMode: string,
    ipAddress: string
  };

  constructor() {
    this.cpuCount = undefined;
    this.memoryMB = undefined;
    this.name = undefined;
    this.network = undefined;
    this.os = undefined;
    this.platform = undefined;
    this.resource = undefined;
    this.storage = undefined;
    this.template = undefined;
  }
}
