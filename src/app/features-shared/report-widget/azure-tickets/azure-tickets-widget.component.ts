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
  CoreRoutes,
  McsNavigationService,
  McsTableListingBase } from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsTicket,
  McsQueryParam,
  McsApiCollection,
  RouteKey,
  TicketStatus,
  ticketStatusText
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

const maxTicketsToDisplay: number = 5;

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
  private _ticketStatusIconMap = new Map<string, string>();
  private _destroySubject = new Subject<void>();

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

  public get ticketListingLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.Tickets);
  }

  public get newTicketLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.TicketCreate);
  }

  public constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService) {
      super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeTickets });
      this.setTicketStatusIconMap();
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
        this.hasMore = result.totalCollectionCount > maxTicketsToDisplay;
        this.changeDetectorRef.markForCheck();
      });
  }

  public getTicketDetailsLink(ticket: McsTicket): string {
    return CoreRoutes.getNavigationPath(RouteKey.TicketDetails) + `/${ticket.id}`;
  }

  public getStatusIcon(status: string): string {
    return this._ticketStatusIconMap.get(status);
  }

  public navigateToTicket(ticket: McsTicket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._navigationService.navigateTo(RouteKey.TicketDetails, [ticket.id]);
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsTicket>> {
    // These will be updated once we have the correct filter...
    query.pageSize = maxTicketsToDisplay;
    return this._apiService.getTickets(query);
  }

  private setTicketStatusIconMap(): void {
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.Closed], CommonDefinition.ASSETS_SVG_STATE_SUSPENDED);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.New], CommonDefinition.ASSETS_SVG_STATE_RUNNING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.InProgress], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.AwaitingCustomer], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.WaitForRfo], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.WaitingForTaskCompletion], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
  }
}
