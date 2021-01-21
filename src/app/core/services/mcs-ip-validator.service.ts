import {
  EventEmitter,
  Injectable
} from '@angular/core';
import { shareReplay } from 'rxjs/operators';

import {
  McsResource,
  McsResourceNetwork,
  McsResourceNetworkIpAddress
} from '@app/models';
import {McsResourceNetworkSubnet } from '@app/models/response/mcs-resource-network-subnet';
import { McsApiService } from '@app/services/mcs-api.service';
import {
  CommonDefinition,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

// Require subnetting javscript class
const Netmask = require('netmask').Netmask;
const DEFAULT_GATEWAY = '192.168.0.1';
const DEFAULT_NETMASK = '255.255.255.0';
const DEFAULT_IP_RANGE_LAST = '3';

@Injectable()
export class McsIpValidatorService {

  public inUsedIpAddressUpdated = new EventEmitter<McsResourceNetworkIpAddress[]>();
  public netMasks: any[];
  public ipAddressesInUsed: McsResourceNetworkIpAddress[];

  private _companyId: string = '';
  private _resource: McsResource;
  private _network: McsResourceNetwork;

  public constructor(private _apiService: McsApiService) {
    this.inUsedIpAddressUpdated = new EventEmitter<McsResourceNetworkIpAddress[]>();
    this.resetNetworkIpInformation();
  }

  public resetNetworkIpInformation(): void {
    this.netMasks = new Array();
    this.netMasks.push(new Netmask(`${DEFAULT_GATEWAY}/${DEFAULT_NETMASK}`));
    this.ipAddressesInUsed = new Array();
  }

  public initNetworkIpInformation(resource: McsResource, network: McsResourceNetwork, companyId: string = ''):  any[] {
    this._resource = resource;
    this._network = network;
    this._companyId = companyId;

    this._createNetmaskByNetwork(network);
    this._setInUsedIpAddresses(network);

    return this.netMasks;
  }

  private _createNetmaskByNetwork(network: McsResourceNetwork) {
    if (isNullOrUndefined(network)) { return; }
    let netWorkSubnets: Array<McsResourceNetworkSubnet> = network.subnets;
    this.netMasks = new Array<any>();
    netWorkSubnets.forEach((subnet)=>{
      this.netMasks.push(new Netmask(`${subnet.gateway}/${subnet.netmask}`));
    });
    this.netMasks.forEach((netMask)=> {
      if (!isNullOrEmpty(netMask.last) &&
      netMask.last === netMask.gateway) {
      netMask.last = netMask.last.replace(/.$/, DEFAULT_IP_RANGE_LAST);
    }
    });
  }

  public isIpAddressInUsed(ipAddress: string): boolean {
    if (isNullOrEmpty(ipAddress)) { return false; }
    return !!this.ipAddressesInUsed.find((inUsed) => ipAddress === inUsed.ipAddress);
  }

  public ipRangeValidator(inputValue: any): boolean {
    try {
      return this.netMasks.find((netMask)=> {
        return (netMask.contains(inputValue) &&
        netMask.broadcast !== inputValue &&
        netMask.base !== inputValue);
      });
    }
    catch (error) {
      return false;
    }
  }

  public ipGatewayValidator(inputValue: any): boolean {
    try {
      let selectedNedworkGateway =  this._network.subnets.find((subnet)=> subnet.gateway === inputValue);
      console.log('selectedNedworkGateway', selectedNedworkGateway);
      return  (isNullOrUndefined(selectedNedworkGateway));
    }
    catch (error) {
      console.log('selectedNedworkGateway', error);
      return false;
    }
  }

  private _setInUsedIpAddresses(network: McsResourceNetwork): void {
    if (isNullOrEmpty(this._resource)) {
      return;
    }

    let hasResourceNetwork = !isNullOrEmpty(this._resource.id) && !isNullOrEmpty(network);
    if (!hasResourceNetwork) { return; }

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    this._apiService.getResourceNetwork(this._resource.id, network.id, optionalHeaders).pipe(
      shareReplay(1)
    ).subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }

      this.ipAddressesInUsed = response.ipAddresses;
      this.inUsedIpAddressUpdated.emit(this.ipAddressesInUsed);
    });
  }
}