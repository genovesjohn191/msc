import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
/** Services */
import { NotificationsService } from './notifications.service';
import { NotificationsDataSource } from './notifications.datasource';
import {
  McsNotificationContextService,
  McsTextContentProvider,
  CoreDefinition,
  McsSearch,
  McsPaginator
} from '../../core';
import {
  formatDate,
  refreshView,
  isNullOrEmpty
} from '../../utilities';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styles: [require('./notifications.component.scss')]
})

export class NotificationsComponent implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  // Filter selector variables
  public columnSettings: any;

  // Table variables
  public dataSource: NotificationsDataSource;
  public dataColumns: string[];

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  private _notificationsSubscription: any;

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get successfullyObtained(): boolean {
    return isNullOrEmpty(this.dataSource) ? false : this.dataSource.successfullyObtained;
  }

  public get noNotificationsFound(): boolean {
    return this.successfullyObtained === true && this.totalRecordCount <= 0;
  }

  public get displayErrorMessage(): boolean {
    return this.dataSource && (this.noNotificationsFound ||
      this.successfullyObtained) === false;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_NOTIFICATIONS_LISTING;
  }

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _notificationsService: NotificationsService,
    private _notificationContextService: McsNotificationContextService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.notifications;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initiliazeDatasource();
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this._notificationsSubscription)) {
      this._notificationsSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
  }

  /**
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
      let columnDetails = Object.keys(this.columnSettings);

      this.dataColumns = [];
      columnDetails.forEach((column) => {
        if (!this.columnSettings[column].value) { return; }
        this.dataColumns.push(column);
      });
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
   * Converts the date and time to string
   * based on the given format
   * @param date Date to be converted
   */
  public convertDateTimeToString(date: Date): string {
    let convertedString: string = '';
    if (date) {
      convertedString = formatDate(date, 'LTS, ddd DD MMM, YYYY');
    }
    return convertedString;
  }

  /**
   * Retry to obtain the source from API
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initiliazeDatasource();
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

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  private _initiliazeDatasource(): void {
    // Set datasource
    this.dataSource = new NotificationsDataSource(
      this._notificationContextService,
      this._notificationsService,
      this.paginator,
      this.search
    );
  }
}
