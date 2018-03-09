import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
/** Services */
import { NotificationsRepository } from './notifications.repository';
import { NotificationsDataSource } from './notifications.datasource';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  McsDataStatus,
  McsAuthenticationIdentity,
  McsApiCompany
} from '../../core';
import {
  refreshView,
  isNullOrEmpty,
  getRecordCountLabel,
  unsubscribeSafely
} from '../../utilities';
import { Subscription } from 'rxjs';

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
  private _notificationsSubscription: Subscription;
  private _accountSubscription: Subscription;

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._notificationsRepository) ? 0 :
      this._notificationsRepository.totalRecordsCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_NOTIFICATIONS_LISTING;
  }

  public get activeCompany(): McsApiCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _textContentProvider: McsTextContentProvider,
    private _notificationsRepository: NotificationsRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.notifications;
    this._listenToAccountUpdate();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._accountSubscription);
    unsubscribeSafely(this._notificationsSubscription);
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
        iconKey = CoreDefinition.ASSETS_GIF_SPINNER;
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
   * Listener for the account update to refresh the view
   */
  private _listenToAccountUpdate(): void {
    this._accountSubscription = this._authenticationIdentity
      .activeAccountChanged
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }
}
