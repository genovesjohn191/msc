import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsBrowserService,
  McsTableListingBase
} from '../../../../core';
import {
  refreshView,
  animateFactory,
  getSafeProperty
} from '../../../../utilities';
import { FirewallPolicy } from '../../models';
import { FirewallsRepository } from '../../repositories/firewalls.repository';
import { FirewallService } from '../firewall.service';
import { FirewallPoliciesDataSource } from './firewall-policies.datasource';

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

export class FirewallPoliciesComponent
  extends McsTableListingBase<FirewallPoliciesDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public selectedFirewallPolicy: FirewallPolicy;

  public get columnFilterIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COLUMNS_BLACK;
  }

  public get infoIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CIRCLE_INFO_BLACK;
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
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _firewallService: FirewallService,
    private _firewallsRepository: FirewallsRepository
  ) {
    super(_browserService, _changeDetectorRef);
    this.selectedFirewallPolicy = new FirewallPolicy();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.firewalls.firewall.policies;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
  }

  /**
   * Display the selected firewall policy details
   * @param policy Firewall Policy data
   */
  public showFirewallPolicyDetails(policy: FirewallPolicy): void {
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
   * Retry obtaining datasource from firewall policies
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Returns the total record count of the policies
   */
  protected get totalRecordsCount(): number {
    return getSafeProperty(this.dataSource,
      (obj) => obj.totalRecordCount, 0);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALL_POLICIES_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    this.dataSource = new FirewallPoliciesDataSource(
      this._firewallsRepository,
      this._firewallService,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
