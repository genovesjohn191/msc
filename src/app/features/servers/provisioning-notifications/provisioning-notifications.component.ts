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
    // this.getNotifications();

    // Add notification update listener
    // this._listenToNotificationUpdate();

    // TODO: Remove this for the official release
    // And uncomment the 2 methods above
    this._populateNotifications();
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

  private _filterProvisioningNotifications(job: McsApiJob): boolean {
    return job.type >= CoreDefinition.JOB_TYPE_SERVER_START &&
      job.type <= CoreDefinition.JOB_TYPE_SERVER_END;
  }

  // TODO: remove this method in official release
  private _populateNotifications() {
    let notification = new McsApiJob();
    // Record 1
    {
      notification.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      notification.id = '0001';
      notification.description = 'Deploying "mongo-db-prod" in Intellicentre 1 (Syd)';
      notification.tasks = new Array();
      notification.ectInSeconds = 30;
      {
        let task = new McsApiTask();
        task.id = '000A';
        task.description = 'Initializing the new Server';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000B';
        task.description = 'Deploying mongo-db-prod: 50GB, 8GB / 2vCPU';
        task.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
        notification.tasks.push(task);
      }
      this.notifications.push(notification);
    }
    // Record 2
    {
      notification = new McsApiJob();
      notification.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      notification.id = '0002';
      notification.endedOn = new Date('2017-04-26 01:10:45');
      notification.description = 'Deploying "mongo-db-prod" in Intellicentre 1 (Syd)';
      notification.ectInSeconds = 100;
      this.notifications.push(notification);
    }
    // Record 3
    {
      notification = new McsApiJob();
      notification.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      notification.id = '0003';
      notification.description = 'Restoring snapshots for "mongo-db"';
      notification.tasks = new Array();
      notification.ectInSeconds = 100;
      {
        let task = new McsApiTask();
        task.id = '000A';
        task.description = 'Initializing stack snapshot restoration';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000B';
        task.description = 'Rolling back to saved snapshot 3:15am, 30 November, 2016';
        task.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
        notification.tasks.push(task);
      }
      this.notifications.push(notification);
    }
  }
}
