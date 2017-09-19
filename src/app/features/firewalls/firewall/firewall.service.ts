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
} from '../../../core/';

@Injectable()
export class FirewallService {

  /**
   * This will notify the subscriber everytime the firewall is selected or
   * everytime there are new data from the firewall server
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
   * The purpose of this one is to get the selected firewall
   * without subscribing to the stream
   */
  private _selectedFirewall: Firewall;
  public get selectedFirewall(): Firewall {
    return this._selectedFirewall;
  }
  public set selectedFirewall(value: Firewall) {
    this._selectedFirewall = value;
  }

  constructor(private _firewallsService: FirewallsService) {
    this._selectedFirewallStream = new BehaviorSubject<Firewall>(new Firewall());
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
  public setSelectedFirewall(id: any): void {
    this.getFirewall(id).subscribe((response) => {
      let firewall: Firewall = response.content;

      if (firewall) {
        this._selectedFirewall = firewall;
        this._selectedFirewallStream.next(firewall);
      }
    });
  }

  /**
   * Get firewall policies (MCS API response)
   * @param id Firewall identification
   */
  public getFirewallPolicies(
    id: any,
    page?: number,
    perPage?: number,
    searchKeyword?: string): Observable<McsApiSuccessResponse<FirewallPolicy[]>> {
    return this._firewallsService.getFirewallPolicies(id);
  }

}
