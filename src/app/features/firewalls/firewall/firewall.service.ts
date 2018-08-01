import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firewall } from '../models';

@Injectable()
export class FirewallService {
  /**
   * This will notify the subscriber everytime the firewall is selected or
   * everytime there are new data from the selected firewall
   */
  public selectedFirewallChange: BehaviorSubject<Firewall>;

  /**
   * Get the selected firewall on the listing panel
   */
  private _selectedFirewall: Firewall;
  public get selectedFirewall(): Firewall { return this._selectedFirewall; }

  constructor() {
    this.selectedFirewallChange = new BehaviorSubject<Firewall>(undefined);
    this._selectedFirewall = new Firewall();
  }

  /**
   * Set firewall data to the stream (MCS API response)
   * @param id Firewall identification
   */
  public setSelectedFirewall(firewall: Firewall): void {
    this._selectedFirewall = firewall;
    this.selectedFirewallChange.next(firewall);
  }
}
