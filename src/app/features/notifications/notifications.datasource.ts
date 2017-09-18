import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsNotificationContextService,
  McsDataSource,
  McsPaginator,
  McsSearch,
  McsApiJob
} from '../../core';
import {
  isNullOrEmpty,
  compareDates,
  mergeArrays
} from '../../utilities';
import { NotificationsService } from './notifications.service';

export class NotificationsDataSource implements McsDataSource<McsApiJob> {
  /**
   * It will populate the data when the obtainment is completed
   */
  private _totalRecordCount: number;
  public get totalRecordCount(): number {
    return this._totalRecordCount;
  }
  public set totalRecordCount(value: number) {
    this._totalRecordCount = value;
  }

  /**
   * Flag if the datasource connect has successfully obtained from API
   */
  private _successfullyObtained: boolean;
  public get successfullyObtained(): boolean {
    return this._successfullyObtained;
  }
  public set successfullyObtained(value: boolean) {
    this._successfullyObtained = value;
  }

  /**
   * This will notify the stream of the table when there are changes on the notifications data
   */
  private _notificationsStream: Subject<McsApiJob[]>;
  public get notificationsStream(): Subject<McsApiJob[]> {
    return this._notificationsStream;
  }
  public set notificationsStream(value: Subject<McsApiJob[]>) {
    this._notificationsStream = value;
  }

  /**
   * All jobs based on the filtering
   */
  private _notifications: McsApiJob[];
  public get notifications(): McsApiJob[] {
    return this._notifications;
  }
  public set notifications(value: McsApiJob[]) {
    if (this._notifications !== value) {
      this._notifications = value;
      this._notificationsStream.next();
    }
  }

  private _notificationsSubscription: any;

  constructor(
    private _notificationContextService: McsNotificationContextService,
    private _notificationsService: NotificationsService,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this._totalRecordCount = 0;
    this._notificationsStream = new Subject<McsApiJob[]>();

    // Listen to all notifications changes and get the notifications job
    this._getNotifications();
    this._listenToNotifications();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<McsApiJob[]> {
    const displayDataChanges = [
      this._notificationsStream
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        return this.notifications;
      });
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    this._totalRecordCount = 0;
    if (!isNullOrEmpty(this._notificationsSubscription)) {
      this._notificationsSubscription.unsubscribe();
    }
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param notifications Data to be provided when the datasource is connected
   */
  public onCompletion(notifications?: McsApiJob[]): void {
    // Execute all data from completion
    this._paginator.pageCompleted();
    this._successfullyObtained = true;
  }

  /**
   * This will invoke when the data obtainment process encountered error
   * @param status Status of the error
   */
  public onError(status?: number): void {
    // Display the error template in the UI
    this._paginator.pageCompleted();
    this._successfullyObtained = false;
  }

  /**
   * Get the notifications according to paginator and search keyword
   */
  private _getNotifications(): void {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    Observable.merge(...displayDataChanges)
      .switchMap(() => {
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        return this._notificationsService.getNotifications(
          this._paginator.pageIndex,
          displayedRecords,
          this._search.keyword
        ).map((response) => {
          this._totalRecordCount = response.totalCount;
          return response.content;
        });
      })
      .subscribe((jobs) => {
        this.notifications = jobs;
      });
  }

  /**
   * Listen to every notifications to get the updated job and reflect it to the list
   */
  private _listenToNotifications(): void {
    this._notificationsSubscription = this._notificationContextService
      .notificationsStream
      .subscribe((updatedNotifications) => {
        let mergedNotifications: McsApiJob[] = new Array();

        // Update all existing notifications based on the notification context
        // and Add the non-exist notifications
        mergedNotifications = mergeArrays(
          this.notifications,
          updatedNotifications,
          (_first, _second) => {
            return (_first.id === _second.id);
          }
        );
        if (!isNullOrEmpty(mergedNotifications) && !isNullOrEmpty(this.notifications)) {
          this._totalRecordCount += (mergedNotifications.length - this.notifications.length);
        }
        this.notifications = mergedNotifications;

        // Sort notification jobs by date
        this.notifications.sort((first: McsApiJob, second: McsApiJob) => {
          return compareDates(second.createdOn, first.createdOn);
        });
      });
  }
}
