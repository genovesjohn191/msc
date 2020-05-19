import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import {
  Observable
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  McsTableListingBase,
  IMcsColumnManager,
  McsAccessControlService
} from '@app/core';
import {
  McsLicense,
  McsApiCollection,
  McsQueryParam,
  McsFilterInfo
} from '@app/models';
import { LicensesService } from './licenses.service';
import {
  getSafeProperty,
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';

@Component({
  selector: 'mcs-licenses',
  templateUrl: './licenses.component.html',
  providers: [LicensesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicensesComponent extends McsTableListingBase<McsLicense> implements OnInit, OnDestroy, IMcsColumnManager {

  public licenses$: Observable<McsLicense[]>;
  private _columnPermissionMatrix = new Map<string, () => boolean>();

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _activatedRoute: ActivatedRoute,
    private _licensesService: LicensesService,
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector, _changeDetectorRef);

  }

  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_LICENSE_LISTING;
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public ngOnInit(): void {
    this._subscribeToLicensesResolver();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  private _subscribeToLicensesResolver(): void {
    this.licenses$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.licenses))
    );
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsLicense>> {
    return this._apiService.getLicenses();
  }

  /**
   * Navigate to licenses target details page
   * @param aggregationTarget Licenses Target to view the details
   */
  public navigateToAggregationTarget(/*target*/): void {
    // check flag
    // navigate
  }

  /**
   * Returns true when the column is included in the display
   */
  public includeColumn(column: McsFilterInfo): boolean {
    if (isNullOrEmpty(this._accessControlService)) { return true; }
    let columnFunc = this._columnPermissionMatrix.get(column.id);
    return columnFunc ? columnFunc() : true;
  }
  /**
   * TODO: apply permissions
   *  Creates the column permission matrix
   */
  private _createColumnMatrix(): void {
  }

  /**
   * TODO: update method on new license creation
   * This will navigate to new server page
   */
  public onClickNewLicenseButton(): void {
    // navigate to route
  }
}
