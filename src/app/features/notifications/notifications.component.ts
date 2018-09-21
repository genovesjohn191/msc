import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  merge,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  McsAuthenticationIdentity
} from '@app/core';
import {
  McsCompany,
  McsDataStatus
} from '@app/models';
import {
  refreshView,
  isNullOrEmpty,
  unsubscribeSubject,
  getSafeProperty
} from '@app/utilities';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsDataSource } from './notifications.datasource';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent
  extends McsTableListingBase<NotificationsDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  // Subscription
  private _destroySubject = new Subject<void>();

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _textContentProvider: McsTextContentProvider,
    private _notificationsRepository: NotificationsRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.notifications;
    this._listenToDataUpdate();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * This will navigate to specified link, otherwise do nothing
   * @param url Url to be navigated
   */
  public tryNavigateTo(url: string): void {
    if (isNullOrEmpty(url)) { return; }
    this._router.navigate([url]);
  }

  /**
   * Get the status icon key based on job
   * @param dataStatus Status that serve as the basis
   */
  public getStatusIconKey(dataStatus: McsDataStatus): string {
    return this._getStatusIcon(dataStatus).key;
  }

  /**
   * Get the status icon color based on job
   * @param dataStatus Status that serve as the basis
   */
  public getStatusIconColor(dataStatus: McsDataStatus): string {
    return this._getStatusIcon(dataStatus).color;
  }

  /**
   * Retry obtaining datasource from notifications
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Returns the totals record found in notifications
   */
  protected get totalRecordsCount(): number {
    return getSafeProperty(this._notificationsRepository,
      (obj) => obj.totalRecordsCount, 0);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_NOTIFICATIONS_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource
    this.dataSource = new NotificationsDataSource(
      this._notificationsRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Get the status icon key based on the job
   * @param dataStatus Status that serve as the basis
   */
  private _getStatusIcon(dataStatus: McsDataStatus): { key, color } {
    let iconKey: string;
    let iconColor: string;

    switch (dataStatus) {
      case McsDataStatus.InProgress:
        iconKey = CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
        iconColor = 'black';
        break;
      case McsDataStatus.Error:
        iconKey = CoreDefinition.ASSETS_FONT_CLOSE;
        iconColor = 'red';
        break;
      case McsDataStatus.Success:
        iconKey = CoreDefinition.ASSETS_FONT_CHECK;
        iconColor = 'green';
        break;
      default:
        break;
    }

    return { key: iconKey, color: iconColor };
  }

  /**
   * Listens for every data and account changed
   */
  private _listenToDataUpdate(): void {
    let requestUpdate = merge(
      this._notificationsRepository.dataRecordsChanged,
      this._authenticationIdentity.activeAccountChanged);

    requestUpdate.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
}
