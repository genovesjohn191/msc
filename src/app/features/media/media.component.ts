import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  RouteKey,
  McsResourceMedia
} from '@app/models';
import {
  MediaRepository,
  ResourcesRepository
} from '@app/services';
import { MediaDataSource } from './media.datasource';

@Component({
  selector: 'mcs-media',
  templateUrl: './media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaComponent
  extends McsTableListingBase<MediaDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public hasResources$: Observable<boolean>;

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _mediaRepository: MediaRepository,
    private _resourcesRepository: ResourcesRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.media;
    this._subscribeToResources();
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
   * Retry obtaining datasource from server
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Returns the totals record found in orders
   */
  protected get totalRecordsCount(): number {
    return getSafeProperty(this._mediaRepository,
      (obj) => obj.totalRecordsCount, 0);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_MEDIA_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new MediaDataSource(
      this._mediaRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Subscribes to resources to set the flag of has resources
   */
  private _subscribeToResources(): void {
    this.hasResources$ = this._resourcesRepository.findAllRecords().pipe(
      map((resources) => !isNullOrEmpty(resources))
    );
  }
}
