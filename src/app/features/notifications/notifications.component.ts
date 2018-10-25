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
  isNullOrEmpty,
  unsubscribeSubject,
  getSafeProperty
} from '@app/utilities';
import { NotificationsRepository } from '@app/services';
import { McsCompany } from '@app/models';
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
