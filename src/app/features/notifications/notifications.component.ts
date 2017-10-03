import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
/** Services */
import { NotificationsService } from './notifications.service';
import { NotificationsDataSource } from './notifications.datasource';
import {
  McsNotificationContextService,
  McsTextContentProvider,
  CoreDefinition,
  McsSearch,
  McsPaginator,
  McsBrowserService,
  McsDeviceType,
  McsTableListingBase
} from '../../core';
import {
  convertDateToStandardString,
  refreshView,
  isNullOrEmpty,
  getRecordCountLabel
} from '../../utilities';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styles: [require('./notifications.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent
  extends McsTableListingBase<NotificationsDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  // Subscription
  private _notificationsSubscription: any;

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_NOTIFICATIONS_LISTING;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _notificationsService: NotificationsService,
    private _notificationContextService: McsNotificationContextService
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.notifications;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    if (!isNullOrEmpty(this._notificationsSubscription)) {
      this._notificationsSubscription.unsubscribe();
    }
  }

  /**
   * Get the status icon key based on job
   * @param status Status that serve as the basis
   */
  public getStatusIconKey(status: string): string {
    return this._getStatusIcon(status).key;
  }

  /**
   * Get the status icon color based on job
   * @param status Status that serve as the basis
   */
  public getStatusIconColor(status: string): string {
    return this._getStatusIcon(status).color;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource
    this.dataSource = new NotificationsDataSource(
      this._notificationContextService,
      this._notificationsService,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Get the status icon key based on the job
   * @param status Status that serve as the basis
   */
  private _getStatusIcon(status: string): { key, color } {
    let iconKey: string;
    let iconColor: string;

    switch (status) {
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        iconKey = CoreDefinition.ASSETS_GIF_SPINNER;
        iconColor = 'black';
        break;
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        iconKey = CoreDefinition.ASSETS_FONT_CLOSE;
        iconColor = 'red';
        break;
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        iconKey = CoreDefinition.ASSETS_FONT_CHECK;
        iconColor = 'green';
        break;
      default:
        break;
    }

    return { key: iconKey, color: iconColor };
  }
}
