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
import {
  McsApiJob,
  McsApiTask,
  McsApiSearchKey,
  McsApiErrorResponse,
  CoreDefinition,
  McsTextContentProvider,
  McsNotificationContextService
} from '../../../core';
import {
  formatDate,
  mergeArrays,
  compareDates,
  refreshView
} from '../../../utilities';
import { ProvisioningNotificationsService } from './provisioning-notifications.service';

@Component({
  selector: 'mcs-provisioning-notifications',
  templateUrl: './provisioning-notifications.component.html',
  styles: [require('./provisioning-notifications.component.scss')]
})

export class ProvisioningNotificationsComponent implements OnInit, OnDestroy {
  public page: number;
  public keyword: string;
  public isLoading: boolean;
  public provisioningNotificationsTextContent: any;
  public notifications: McsApiJob[];
  public totalNotificationsCount: number;

  public notificationsSubscription: any;

  /** Search Subscription */
  public searchSubscription: any;
  public searchKeyword: string;
  public searchSubject: Subject<McsApiSearchKey>;

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _notificationContextService: McsNotificationContextService,
    private _provisioningNotificationService: ProvisioningNotificationsService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.page = 1;
    this.totalNotificationsCount = 0;
    this.isLoading = true;
    this.notifications = new Array();
    this.searchSubject = new Subject<McsApiSearchKey>();
    this.provisioningNotificationsTextContent =
      this._textContentProvider.content.servers.provisioningNotifications;
  }

  public ngOnInit() {
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
        return this._provisioningNotificationService.getNotifications(
          searchKey.page,
          searchKey.maxItemPerPage ?
            searchKey.maxItemPerPage : CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE,
          searchKey.keyword
        ).finally(() => this.isLoading = false);
      })
      .catch((error: McsApiErrorResponse) => {
        return Observable.throw(error);
      })
      .subscribe((mcsApiResponse) => {
        // Get server response
        if (this.page === 1) { this.notifications.splice(0); }
        if (mcsApiResponse.content) {
          this.notifications = mergeArrays(this.notifications, mcsApiResponse.content);
          this.totalNotificationsCount = mcsApiResponse.totalCount;
        }
      });
  }

  public getContextInformation(job: McsApiJob): string {
    // Check job status based on type to determine if the job
    // is deploying or restoring, and assign the corresponding
    // Contextual help based on the text-content.provider
    // TODO: Check the job status for contextual help (deploy, restoring)
    return this.provisioningNotificationsTextContent.contextualHelp.deploy;
  }

  private _listenToNotificationUpdate(): void {
    // listener for the notification updates
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {

        if (this.isLoading === false) {
          let provisioningNotifications: any;
          provisioningNotifications = updatedNotifications
            .filter(this._filterProvisioningNotifications.bind(this));

          this._onChangeNotification(provisioningNotifications);
          refreshView(() => {
            this._changeDetectorRef.detectChanges();
          });
        }
      });
  }

  private _onChangeNotification(updatedNotifications: any): void {
    // Update all existing notifications based on the notification context
    // and Add the non-exist notifications
    this.notifications = mergeArrays(this.notifications, updatedNotifications);
    this.totalNotificationsCount = this.notifications.length;

    // Sort notification jobs by date
    this.notifications.sort((first: McsApiJob, second: McsApiJob) => {
      return compareDates(second.createdOn, first.createdOn);
    });
  }

  private _filterProvisioningNotifications(job: McsApiJob): boolean {
    return job.type >= CoreDefinition.JOB_TYPE_SERVER_START &&
      job.type <= CoreDefinition.JOB_TYPE_SERVER_END;
  }
}
