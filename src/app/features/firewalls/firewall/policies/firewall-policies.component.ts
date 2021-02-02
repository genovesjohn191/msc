import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import {
  McsFilterInfo,
  McsFirewallPolicy,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  animateFactory,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

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
export class FirewallPoliciesComponent {
  public readonly dataSource: McsTableDataSource2<McsFirewallPolicy>;
  public readonly dataEvents: McsTableEvents<McsFirewallPolicy>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public selectedFirewallPolicy: McsFirewallPolicy;

  constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _firewallService: FirewallService
  ) {
    this.selectedFirewallPolicy = new McsFirewallPolicy();

    this.dataSource = new McsTableDataSource2(this._getFirewallPolicies.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'sequence' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'sourceInterfaces' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'destinationInterfaces' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'source' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'destination' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'label' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'schedule' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'service' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public get columnFilterIconKey(): string {
    return CommonDefinition.ASSETS_SVG_COLUMNS_BLACK;
  }

  public get firewallPoliciesModeEnum(): any {
    return FirewallPoliciesMode;
  }

  private _firewallPoliciesMode: FirewallPoliciesMode = FirewallPoliciesMode.Listing;
  public get firewallPoliciesMode(): FirewallPoliciesMode { return this._firewallPoliciesMode; }
  public set firewallPoliciesMode(value: FirewallPoliciesMode) {
    if (this._firewallPoliciesMode !== value) {
      this._firewallPoliciesMode = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public showFirewallPolicyDetails(policy: McsFirewallPolicy): void {
    this.selectedFirewallPolicy = policy;
    this.firewallPoliciesMode = FirewallPoliciesMode.Details;
  }

  public hideFirewallPolicyDetails(): void {
    this.firewallPoliciesMode = FirewallPoliciesMode.Listing;
  }

  private _getFirewallPolicies(
    param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<McsFirewallPolicy>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getFirewallPolicies(
      this._firewallService.selectedFirewall.id,
      queryParam
    ).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      )
    );
  }
}
