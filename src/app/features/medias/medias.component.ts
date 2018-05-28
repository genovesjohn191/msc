import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
/** Models */
import { Media } from './models';
/** Repository */
import { MediasRepository } from './medias.repository';
/** Datasource */
import { MediasDataSource } from './medias.datasource';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase
} from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  getRecordCountLabel,
  unsubscribeSafely
} from '../../utilities';

@Component({
  selector: 'mcs-medias',
  templateUrl: './medias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediasComponent
  extends McsTableListingBase<MediasDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public enumDefinition: any;

  // Subscription
  private _selectionModeSubscription: any;
  private _notificationsChangeSubscription: any;

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._mediasRepository) ? 0 :
      this._mediasRepository.totalRecordsCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_MEDIA_LISTING;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _mediasRepository: MediasRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.medias;
    this.enumDefinition = this._textProvider.content.enumerations;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._selectionModeSubscription);
    unsubscribeSafely(this._notificationsChangeSubscription);
  }

  /**
   * Returns media attached to server count and label
   * @param media Media
   */
  public getAttachedToCountLabel(media: Media): string {
    return getRecordCountLabel(media.attachedTo, 'Server', 'Servers');
  }

  /**
   * This will navigate to new media page
   */
  public onClickNewMediaButton() {
    this._router.navigate(['./media/new']);
  }

  /**
   * Navigate to media details page
   * @param media Media to view the details
   */
  public navigateToMedia(media: Media): void {
    if (isNullOrEmpty(media)) { return; }
    this._router.navigate(['/media/', media.id]);
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
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new MediasDataSource(
      this._mediasRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
