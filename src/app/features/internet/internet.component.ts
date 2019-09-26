import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsTableListingBase,
  McsNavigationService
} from '@app/core';
import { McsEvent } from '@app/events';
import { McsApiService } from '@app/services';
import {
  RouteKey,
  McsInternetPort,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-internet',
  templateUrl: './internet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetComponent extends McsTableListingBase<McsInternetPort> {

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
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
    this._navigationService.navigateTo(RouteKey.InternetDetails, [internet.id]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_INTERNET_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsInternetPort>> {
    return this._apiService.getInternetPorts(query);
  }
}
