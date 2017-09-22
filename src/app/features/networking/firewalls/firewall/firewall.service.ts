import { Injectable } from '@angular/core';
import { FirewallsService } from '../firewalls.service';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  Firewall,
  FirewallPolicy
} from '../models';
import {
  McsApiSuccessResponse,
  McsApiJob,
  CoreDefinition
} from '../../../../core/';

@Injectable()
export class FirewallService {

  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  private _selectedFirewallStream: BehaviorSubject<Firewall>;
  public get selectedFirewallStream(): BehaviorSubject<Firewall> {
    return this._selectedFirewallStream;
  }
  public set selectedFirewallStream(value: BehaviorSubject<Firewall>) {
    this._selectedFirewallStream = value;
  }

  /**
   * This contains the selected firewall and this will be accessible
   * for those component that are using this service.
   */
  private _selectedFirewall: Firewall;
  public get selectedFirewall(): Firewall {
    return this._selectedFirewall;
  }
  public set selectedFirewall(value: Firewall) {
    this._selectedFirewall = value;
  }

  constructor(private _firewallsService: FirewallsService) {
    this._selectedFirewall = new Firewall();
  }

  /**
   * Get firewall data (MCS API response)
   * @param id Firewall identification
   */
  public getFirewall(id: any): Observable<McsApiSuccessResponse<Firewall>> {
    return this._firewallsService.getFirewall(id);
  }

  /**
   * Set firewall data to the stream (MCS API response)
   * @param id Firewall identification
   */
  public setSelectedFirewall(firewall: Firewall): void {
    this.selectedFirewallStream.next(firewall);
    this.selectedFirewall = firewall;
  }

  /**
   * Get firewall policies (MCS API response)
   * @param id Firewall identification
   */
  public getFirewallPolicies(
    id: any,
    page?: number,
    perPage?: number): Observable<McsApiSuccessResponse<FirewallPolicy[]>> {
    return this._firewallsService.getFirewallPolicies(id);
  }

}
