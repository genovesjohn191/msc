import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { McsFirewall } from '@app/models';

@Injectable()
export class FirewallService {
  /**
   * This will notify the subscriber everytime the firewall is selected or
   * everytime there are new data from the selected firewall
   */
  public selectedFirewallChange: BehaviorSubject<McsFirewall>;
  private _firewallId: string;

  /**
   * Get the selected firewall on the listing panel
   */
  private _selectedFirewall: McsFirewall;
  public get selectedFirewall(): McsFirewall { return this._selectedFirewall; }

  constructor() {
    this.selectedFirewallChange = new BehaviorSubject<McsFirewall>(undefined);
    this._selectedFirewall = new McsFirewall();
  }

  /**
   * Set firewall data to the stream (MCS API response)
   * @param id Firewall identification
   */
  public setSelectedFirewall(firewall: McsFirewall): void {
    this._selectedFirewall = firewall;
    this.selectedFirewallChange.next(firewall);
  }

  /**
   * Sets the firewall id based on the provided string
   * @param firewallId Firewall id to be set
   */
  public setFirewallId(firewallId: string): void {
    this._firewallId = firewallId;
  }

  /**
   * Returns the firewall id
   */
  public getFirewallId(): string {
    return this._firewallId;
  }
}
