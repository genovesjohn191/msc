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
  Subject,
  Observable
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  McsTextContentProvider,
  CoreDefinition,
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
  McsJob
} from '@app/models';
import {
  EventBusPropertyListenOn,
  EventBusState
} from '@app/event-bus';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent
  extends McsTableListingBase<McsTableDataSource<McsJob>>
  implements OnInit, AfterViewInit, OnDestroy {

  @EventBusPropertyListenOn(EventBusState.AccountChange)
  public activeCompany$: Observable<McsCompany>;

  public textContent: any;
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
    private _jobsRepository: McsJobsRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.notifications;
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
