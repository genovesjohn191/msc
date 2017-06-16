import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';

/** Services */
import { NotificationsService } from './notifications.service';
import {
  McsAssetsProvider,
  McsTextContentProvider,
  McsApiSearchKey,
  CoreDefinition,
  McsApiJob,
  McsApiErrorResponse,
  McsNotificationContextService
} from '../../core';
import {
  formatDate,
  mergeArrays,
  compareDates,
  refreshView
} from '../../utilities';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styles: [require('./notifications.component.scss')]
})

export class NotificationsComponent implements OnInit, OnDestroy {
  public page: number;
  public keyword: string;
  public isLoading: boolean;
  public errorMessage: string;
  public notificationsTextContent: any;
  public totalNotificationsCount: number;
  public notifications: McsApiJob[];
  public notificationsSubscription: any;

  /** Search Subscription */
  public searchSubscription: any;
  public searchKeyword: string;
  public searchSubject: Subject<McsApiSearchKey>;

  public hasError: boolean;
  // Done loading and thrown an error
  public get loadedSuccessfully(): boolean {
    return !this.hasError;
  }

  // Done loading and no servers to display
  public get noNotifications(): boolean {
    return this.totalNotificationsCount === 0 && !this.hasError && !this.keyword && !this.isLoading;
  }

  // Done loading and no servers found on filter
  public get emptySearchResult(): boolean {
    return this.totalNotificationsCount === 0 && this.keyword && !this.isLoading;
  }

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _textContentProvider: McsTextContentProvider,
    private _notificationsService: NotificationsService,
    private _notificationContextService: McsNotificationContextService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.page = 1;
    this.totalNotificationsCount = 0;
    this.isLoading = true;
    this.hasError = false;
    this.notifications = new Array();
    this.searchSubject = new Subject<McsApiSearchKey>();
  }

  public ngOnInit() {
    this.notificationsTextContent = this._textContentProvider.content.notifications;

    // obtainment of notifications from the API
    this.getNotifications();

    // Add notification update listener
    this._listenToNotificationUpdate();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
  }

  public getNotifications(): void {
    this.isLoading = true;

    this.searchSubscription = Observable.of(new McsApiSearchKey())
      .concat(this.searchSubject)
      .debounceTime(CoreDefinition.SEARCH_TIME)
      .distinctUntilChanged((previous, next) => {
        return previous.isEqual(next);
      })
      .switchMap((searchKey) => {
        // Switch observable items to server list
        return this._notificationsService.getNotifications(
          searchKey.page,
          searchKey.maxItemPerPage ?
            searchKey.maxItemPerPage : CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE,
          searchKey.keyword
        ).finally(() => this.isLoading = false);
      })
      .catch((error: McsApiErrorResponse) => {
        this.hasError = true;
        return Observable.throw(error);
      })
      .subscribe((mcsApiResponse) => {
        // Get server response
        if (this.page === 1) { this.notifications.splice(0); }
        if (mcsApiResponse.content) {
          this.hasError = false;
          this.notifications = mergeArrays(this.notifications, mcsApiResponse.content);
          this.totalNotificationsCount = mcsApiResponse.totalCount;
        }
      });
  }

  public getIconClass(status: string): string {
    let iconClass: string;

    switch (status) {
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        iconClass = this._assetsProvider.getIcon('spinner');
        iconClass += ' text-color-active';
        break;
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        iconClass = this._assetsProvider.getIcon('close');
        iconClass += ' text-color-failed';
        break;
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        iconClass = this._assetsProvider.getIcon('check');
        iconClass += ' text-color-completed';
        break;
      default:
        break;
    }

    return iconClass;
  }

  public getSpinnerClass(): string {
    return this._assetsProvider.getIcon('spinner');
  }

  public onClickMoreEvent(): void {
    this._getNextPage();
  }

  public onSearchEvent(key: any): void {
    this._searchNotifications(key);
  }

  public onEnterSearchEvent(): void {
    this._searchNotifications(this.keyword);
  }

  public getDisplayNotificationsCount(): number {
    return this.page * CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE;
  }

  public convertDateTimeToString(date: Date): string {
    let convertedString: string = '';
    if (date) {
      convertedString = formatDate(date, 'LTS, ddd DD MMM, YYYY');
    }
    return convertedString;
  }

  private _getNextPage(): void {
    this.page += 1;
    this._updateNotifications(this.keyword, this.page);
  }

  private _searchNotifications(key: any): void {
    this.page = 1;
    this.keyword = key;
    this._updateNotifications(this.keyword, this.page);
  }

  private _updateNotifications(key?: string, page?: number) {
    let searchKey: McsApiSearchKey = new McsApiSearchKey();
    // Set server search key
    searchKey.maxItemPerPage = CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE;
    searchKey.page = page;
    searchKey.keyword = key;
    // Set false to load flag
    this.isLoading = true;
    this.searchSubject.next(searchKey);
  }

  private _listenToNotificationUpdate(): void {
    // listener for the notification updates
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {

        if (this.isLoading === false) {
          this._onChangeNotification(updatedNotifications);
          refreshView(() => {
            this._changeDetectorRef.detectChanges();
          }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        }
      });
  }

  private _onChangeNotification(updatedNotifications: any): void {
    // Update all existing notifications based on the notification context
    // and Add the non-exist notifications
    this.notifications = mergeArrays(
      this.notifications,
      updatedNotifications,
      (_first, _second) => {
        return (_first.id === _second.id);
      }
    );
    this.totalNotificationsCount = this.notifications.length;

    // Sort notification jobs by date
    this.notifications.sort((first: McsApiJob, second: McsApiJob) => {
      return compareDates(second.createdOn, first.createdOn);
    });
  }
}
