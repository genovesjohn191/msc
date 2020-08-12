import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  Injector,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import { McsApiService } from '@app/services';
import {
  McsNavigationService,
  McsTableListingBase } from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsTicket,
  McsQueryParam,
  McsApiCollection,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

@Component({
  selector: 'mcs-azure-tickets-widget',
  templateUrl: './azure-tickets-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class AzureTicketsWidgetComponent extends McsTableListingBase<McsTicket>implements OnInit, OnDestroy {

  private _destroySubject = new Subject<void>();
  private _maxTicketsToDisplay: number = 5;

  public empty: boolean = false;
  public hasError: boolean = false;
  public processing: boolean = false;
  public hasMore: boolean = false;

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_TICKET_LISTING;
  }

  public constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService) {
      super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeTickets });
  }

  public ngOnInit() {
    this.getData();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public retry(): void {
    this.getData();
    this.retryDatasource();
  }

  public getData(): void {
    this.processing = true;
    this.hasError = false;
    this.empty = false;

    this.getEntityListing({}).pipe(
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Tickets endpoint failed.');
      }),
      takeUntil(this._destroySubject))
      .subscribe((result) => {
        this.processing = false;
        this.empty = result.totalCollectionCount === 0;
        this.hasMore = result.totalCollectionCount > this._maxTicketsToDisplay;
        this.changeDetectorRef.markForCheck();
      });
  }

  public navigateToTicket(ticket: McsTicket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._navigationService.navigateTo(RouteKey.TicketDetails, [ticket.id]);
  }

  public navigateToTicketListing(): void {
    this._navigationService.navigateTo(RouteKey.Tickets);
  }

  public onClickNewTicket(): void {
    this._navigationService.navigateTo(RouteKey.TicketCreate);
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsTicket>> {
    // These will be updated once we have the correct filter...
    query.pageSize = this._maxTicketsToDisplay;
    return this._apiService.getTickets(query);
  }
}
