import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsBrowserService,
  McsTableListingBase
} from '../../../../../core';
import {
  FirewallPolicy,
  FirewallPolicyAction
} from '../../models';
import { FirewallService } from '../firewall.service';
import { FirewallPoliciesDataSource } from './firewall-policies.datasource';
import {
  refreshView,
  isNullOrEmpty,
  replacePlaceholder,
  getRecordCountLabel
} from '../../../../../utilities';

const FIREWALL_POLICY_SEQUENCE_PLACEHOLDER = 'sequence';

@Component({
  selector: 'mcs-firewall-policies',
  styleUrls: ['./firewall-policies.component.scss'],
  templateUrl: './firewall-policies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallPoliciesComponent
  extends McsTableListingBase<FirewallPoliciesDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public firewallPoliciesTextContent: any;
  public firewallPolicyTextContent: any;

  // Filter selector variables
  public columnSettings: any;

  // Table variables
  public dataSource: FirewallPoliciesDataSource;
  public dataColumns: string[];

  public isViewMode: boolean;
  public selectedFirewallPolicy: FirewallPolicy;

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.firewallPoliciesTextContent.dataSingular,
      this.firewallPoliciesTextContent.dataPlural);
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALL_POLICIES_LISTING;
  }

  public get columnFilterIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COLUMNS_BLACK;
  }

  public get infoIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CIRCLE_INFO_BLACK;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  public get firewallPolicyTitle(): string {
    if (isNullOrEmpty(this.selectedFirewallPolicy.objectSequence)) { return ''; }

    let sequence = this.selectedFirewallPolicy.objectSequence;

    return replacePlaceholder(
      this.firewallPolicyTextContent.title,
      FIREWALL_POLICY_SEQUENCE_PLACEHOLDER,
      sequence.toString()
    );
  }

  constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _firewallService: FirewallService,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
    this.dataColumns = new Array();
    this.isViewMode = false;
    this.selectedFirewallPolicy = new FirewallPolicy();
  }

  public ngOnInit() {
    this.firewallPoliciesTextContent
      = this._textContentProvider.content.firewalls.firewall.policies;
    this.firewallPolicyTextContent = this.firewallPoliciesTextContent.policy;
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
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
      let columnDetails = Object.keys(this.columnSettings);

      this.dataColumns = [];
      columnDetails.forEach((column) => {
        if (!this.columnSettings[column].value) { return; }
        this.dataColumns.push(column);
      });
    }
  }

  /**
   * Navigate to firewall policy details page
   * @param policy Firewall policy to view the details
   */
  public navigateToServer(policy: FirewallPolicy): void {
    if (isNullOrEmpty(policy)) { return; }
    this._router.navigate(['/firewalls/', policy.id]);
  }

  /**
   * Display the selected firewall policy details
   * @param policy Firewall Policy data
   */
  public showFirewallPolicyDetails(policy: FirewallPolicy): void {
    this.selectedFirewallPolicy = policy;
    this.isViewMode = true;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Hide the firewall policy details and go back to firewall policy listing
   */
  public hideFirewallPolicyDetails(): void {
    this.selectedFirewallPolicy = new FirewallPolicy();
    this.isViewMode = false;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Convert the firewall action enum to string
   * @param value firewall action value
   */
  public getActionEnumString(value: number): string {
    if (value < 0) { return ''; }
    return FirewallPolicyAction[value];
  }

  /**
   * Convert the firewall action enum to string
   * @param value firewall action value
   */
  public getActionIconKey(value: number): string {
    if (value < 0) { return ''; }

    let iconKey = '';
    switch (value) {
      case FirewallPolicyAction.Disabled:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallPolicyAction.Enabled:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }

    return iconKey;
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
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    this.dataSource = new FirewallPoliciesDataSource(
      this._firewallService,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
