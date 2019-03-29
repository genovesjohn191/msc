import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  merge,
  Subject,
  Observable
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  CoreDefinition,
  CoreRoutes,
  CoreEvent,
  McsBrowserService,
  McsTableListingBase,
  McsAuthenticationIdentity,
  McsTableDataSource
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import { McsJobsRepository } from '@app/services';
import {
  McsCompany,
  McsJob,
  RouteKey
} from '@app/models';
import { EventBusPropertyListenOn } from '@app/event-bus';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent
  extends McsTableListingBase<McsTableDataSource<McsJob>>
  implements AfterViewInit, OnDestroy {

  @EventBusPropertyListenOn(CoreEvent.accountChange)
  public activeCompany$: Observable<McsCompany>;

  private _destroySubject = new Subject<void>();

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _jobsRepository: McsJobsRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
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
   * Navigates to notification page
   * @param job Notification job on where to go
   */
  public navigateToNotification(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.Notification),
      job.id
    ]);
  }

  /**
   * Retry obtaining datasource from notifications
   */
  public retryDatasource(): void {
    this.initializeDatasource();
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
    this.dataSource = new McsTableDataSource(this._jobsRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);

    this._subscribeToDataUpdate();
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Subscribe to data updates that includes the obtainment of the account change
   */
  private _subscribeToDataUpdate(): void {
    let requestUpdate = merge(
      this._jobsRepository.dataChange(),
      this.dataSource.dataRenderedChange()
    );

    requestUpdate.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
}
