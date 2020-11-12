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
  map
} from 'rxjs/operators';
import { McsApiService } from '@app/services';
import {
  CoreRoutes,
  McsFilterService,
  McsMatTableContext,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  McsTicket,
  McsApiCollection,
  RouteKey,
  TicketStatus,
  ticketStatusText,
  McsTicketQueryParams
} from '@app/models';
import {
  cloneObject,
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

export class AzureTicketsWidgetComponent implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsTicket>;

  private _ticketStatusIconMap = new Map<string, string>();
  private _destroySubject = new Subject<void>();

  public empty: boolean = false;
  public hasError: boolean = false;
  public processing: boolean = false;
  public hasMore: boolean = false;

  public get routeKeyEnum(): any {
    return RouteKey;
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
    private _filterService: McsFilterService,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2(this.getData.bind(this));
    this.setTicketStatusIconMap();
  }

  public ngOnInit() {
    this._initializeDataColumns();
  }

  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_TICKET_LISTING;
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private getData(): Observable<McsMatTableContext<McsTicket>> {
    this.processing = true;
    this.hasError = false;
    this.empty = false;
    let queryParam = new McsTicketQueryParams();
    queryParam.pageSize = maxTicketsToDisplay;
    queryParam.serviceId = 'AZ';
    queryParam.state = 'open';

    return this._apiService.getTickets(queryParam).pipe(
      map((response) => {
        this.processing = false;
        this.empty = response.totalCollectionCount === 0;
        this.hasMore = response.totalCollectionCount > maxTicketsToDisplay;
        this._changeDetectorRef.markForCheck();

        let azureTickets: McsTicket[] = [];
        azureTickets.push(...cloneObject(response.collection));

        let dataSourceContext = new McsMatTableContext(azureTickets, azureTickets.length);
        return dataSourceContext;
      }),
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Tickets endpoint failed.');
      })
    );
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

  private setTicketStatusIconMap(): void {
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.Closed], CommonDefinition.ASSETS_SVG_STATE_SUSPENDED);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.New], CommonDefinition.ASSETS_SVG_STATE_RUNNING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.InProgress], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.AwaitingCustomer], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.WaitForRfo], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.WaitingForTaskCompletion], CommonDefinition.ASSETS_SVG_STATE_RESTARTING);
  }

  private _initializeDataColumns(): void {
    let dataColumns = this._filterService.getFilterSettings(
      CommonDefinition.FILTERSELECTOR_AZURE_TICKETS_WIDGET_LISTING);
    this.dataSource.registerColumnsFilterInfo(dataColumns);
  }
}
