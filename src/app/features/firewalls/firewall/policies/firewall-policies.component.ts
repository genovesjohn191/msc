import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import { McsTableListingBase } from '@app/core';
import {
  animateFactory,
  CommonDefinition
} from '@app/utilities';
import {
  McsFirewallPolicy,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { FirewallService } from '../firewall.service';

// Enumeration
export enum FirewallPoliciesMode {
  Listing = 1,
  Details = 2
}

@Component({
  selector: 'mcs-firewall-policies',
  templateUrl: './firewall-policies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'block'
  }
})

export class FirewallPoliciesComponent extends McsTableListingBase<McsFirewallPolicy> {
  public selectedFirewallPolicy: McsFirewallPolicy;

  public get columnFilterIconKey(): string {
    return CommonDefinition.ASSETS_SVG_COLUMNS_BLACK;
  }

  public get infoIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CIRCLE_INFO_BLACK;
  }

  /**
   * Returns the firewall policies mode enum
   */
  public get firewallPoliciesModeEnum(): any {
    return FirewallPoliciesMode;
  }

  /**
   * Returns the firewall policies viewing mode
   */
  private _firewallPoliciesMode: FirewallPoliciesMode = FirewallPoliciesMode.Listing;
  public get firewallPoliciesMode(): FirewallPoliciesMode { return this._firewallPoliciesMode; }
  public set firewallPoliciesMode(value: FirewallPoliciesMode) {
    if (this._firewallPoliciesMode !== value) {
      this._firewallPoliciesMode = value;
      this.changeDetectorRef.markForCheck();
    }
  }

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _firewallService: FirewallService
  ) {
    super(_injector, _changeDetectorRef);
    this.selectedFirewallPolicy = new McsFirewallPolicy();
  }

  /**
   * Display the selected firewall policy details
   * @param policy Firewall Policy data
   */
  public showFirewallPolicyDetails(policy: McsFirewallPolicy): void {
    this.selectedFirewallPolicy = policy;
    this.firewallPoliciesMode = FirewallPoliciesMode.Details;
  }

  /**
   * Hide the firewall policy details and go back to firewall policy listing
   */
  public hideFirewallPolicyDetails(): void {
    this.firewallPoliciesMode = FirewallPoliciesMode.Listing;
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_FIREWALL_POLICIES_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsFirewallPolicy>> {
    return this._apiService.getFirewallPolicies(this._firewallService.selectedFirewall.id, query);
  }
}
