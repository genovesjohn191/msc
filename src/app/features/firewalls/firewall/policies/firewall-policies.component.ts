import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsBrowserService,
  McsTableListingBase,
  McsTableDataSource
} from '@app/core';
import { animateFactory } from '@app/utilities';
import { McsFirewallPolicy } from '@app/models';
import { McsFirewallsRepository } from '@app/services';
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

export class FirewallPoliciesComponent
  extends McsTableListingBase<McsTableDataSource<McsFirewallPolicy>>
  implements OnInit, AfterViewInit, OnDestroy {
  public textContent: any;
  public selectedFirewallPolicy: McsFirewallPolicy;

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
    private _firewallsRepository: McsFirewallsRepository
  ) {
    super(_browserService, _changeDetectorRef);
    this.selectedFirewallPolicy = new McsFirewallPolicy();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.firewalls.firewall.policies;
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
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
   * Retry obtaining datasource from firewall policies
   */
  public retryDatasource(): void {
    this.initializeDatasource();
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
    this.dataSource = new McsTableDataSource(this._firewallPoliciesSource.bind(this));
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Returns the firewall policies
   */
  private _firewallPoliciesSource(): Observable<McsFirewallPolicy[]> {
    return this._firewallsRepository.getFirewallPolicies(
      this._firewallService.selectedFirewall,
      {
        keyword: this.search.keyword,
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize
      }
    );
  }
}
