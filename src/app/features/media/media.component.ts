import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsRouteKey
} from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  getSafeProperty
} from '../../utilities';
import { Media } from './models';
import { MediaRepository } from './repositories/media.repository';
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

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _mediaRepository: MediaRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.media;
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
   * This will navigate to new media page
   */
  public onClickNewMediaButton() {
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.MediaCreate)]);
  }

  /**
   * Navigate to media details page
   * @param media Media to view the details
   */
  public navigateToMedia(media: Media): void {
    if (isNullOrEmpty(media)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.Medium), media.id]);
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
}
