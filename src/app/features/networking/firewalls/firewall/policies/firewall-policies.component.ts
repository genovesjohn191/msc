import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  McsPaginator,
  McsSearch,
  McsTextContentProvider,
  CoreDefinition
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
  getEnumString,
  replacePlaceholder
} from '../../../../../utilities';

const FIREWALL_POLICY_SEQUENCE_PLACEHOLDER = 'sequence';

@Component({
  selector: 'mcs-firewall-policies',
  styles: [require('./firewall-policies.component.scss')],
  templateUrl: './firewall-policies.component.html'
})

export class FirewallPoliciesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

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

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALL_POLICIES_LISTING;
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
    private _textContentProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute,
    private _firewallService: FirewallService
  ) {
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
      this._initializeDatasource();
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
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
   * Display the selected firewall policy details
   * @param policy Firewall Policy data
   */
  public showFirewallPolicyDetails(policy: FirewallPolicy): void {
    this.selectedFirewallPolicy = policy;
    this.isViewMode = true;
  }

  /**
   * Hide the firewall policy details and go back to firewall policy listing
   */
  public hideFirewallPolicyDetails(): void {
    this.selectedFirewallPolicy = new FirewallPolicy();
    this.isViewMode = false;
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
   * Retry to obtain the source from API
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initializeDatasource();
  }

  private _initializeDatasource(): void {
    this.dataSource = new FirewallPoliciesDataSource(
      this._firewallService,
      this.paginator,
      this.search
    );
  }
}
