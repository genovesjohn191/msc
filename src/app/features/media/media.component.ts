import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CoreDefinition,
  CoreRoutes,
  McsTableListingBase
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsResourceMedia,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-media',
  templateUrl: './media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaComponent extends McsTableListingBase<McsResourceMedia> implements OnInit {

  public hasResources$: Observable<boolean>;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeMedia,
      dataClearEvent: McsEvent.dataClearMedia
    });
  }

  public ngOnInit() {
    this._subscribeToResources();
  }

  /**
   * Returns the add icon key
   */
  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  /**
   * Returns the routekey enum instance
   */
  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Navigate to media details page
   * @param media Media to view the details
   */
  public navigateToMedia(media: McsResourceMedia): void {
    if (isNullOrEmpty(media)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Medium), media.id]);
  }

  /**
   * Navigates to media upload
   */
  public navigateToMediaUpload(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.MediaUpload)]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_MEDIA_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsResourceMedia>> {
    return this._apiService.getMedia(query);
  }

  /**
   * Subscribes to resources to set the flag of has resources
   */
  private _subscribeToResources(): void {
    this.hasResources$ = this._apiService.getResources().pipe(
      map((resources) => !isNullOrEmpty(resources))
    );
  }
}
