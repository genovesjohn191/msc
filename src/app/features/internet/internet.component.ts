import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  CoreDefinition,
  McsTableListingBase,
  CoreRoutes
} from '@app/core';
import { McsEvent } from '@app/event-manager';
import { McsApiService } from '@app/services';
import {
  RouteKey,
  McsInternetPort,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-internet',
  templateUrl: './internet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetComponent extends McsTableListingBase<McsInternetPort> {

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeInternetPorts });
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  /**
   * Navigate to internet details page
   * @param internet Internet Port to view the details
   */
  public navigateToInternet(internet: McsInternetPort): void {
    if (isNullOrEmpty(internet)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.InternetDetails), internet.id]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_INTERNET_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsInternetPort>> {
    return this._apiService.getInternetPorts(query);
  }
}
