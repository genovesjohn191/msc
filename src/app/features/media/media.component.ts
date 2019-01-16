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
  CoreRoutes,
  McsTableDataSource
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsResourceMedia
} from '@app/models';
import {
  McsMediaRepository,
  McsResourcesRepository
} from '@app/services';

@Component({
  selector: 'mcs-media',
  templateUrl: './media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaComponent
  extends McsTableListingBase<McsTableDataSource<McsResourceMedia>>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public hasResources$: Observable<boolean>;

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _mediaRepository: McsMediaRepository,
    private _resourcesRepository: McsResourcesRepository
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
    this.initializeDatasource();
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
    this.dataSource = new McsTableDataSource(this._mediaRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Subscribes to resources to set the flag of has resources
   */
  private _subscribeToResources(): void {
    this.hasResources$ = this._resourcesRepository.getAll().pipe(
      map((resources) => !isNullOrEmpty(resources))
    );
  }
}
