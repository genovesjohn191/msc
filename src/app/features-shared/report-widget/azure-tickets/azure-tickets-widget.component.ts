import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  Output,
  ViewEncapsulation
} from '@angular/core';

import {
  throwError,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import { McsApiTicketsService } from '@app/api-client/services/mcs-api-tickets.service';
import {
  CoreRoutes,
  McsMatTableContext,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  ticketStatusText,
  McsTicket,
  McsTicketQueryParams,
  RouteKey,
  TicketStatus,
  McsFilterInfo
} from '@app/models';
import {
  cloneObject,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  createObject
} from '@app/utilities';

const maxTicketsToDisplay: number = 5;

@Component({
  selector: 'mcs-azure-tickets-widget',
  templateUrl: './azure-tickets-widget.component.html',
  styleUrls: ['../report-widget.scss', './azure-tickets-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class AzureTicketsWidgetComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsTicket>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public hasMore: boolean = false;

  private _ticketStatusIconMap = new Map<string, string>();
  private _destroySubject = new Subject<void>();

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get ticketListingLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.Tickets);
  }

  public get newTicketLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.TicketCreate);
  }

  @Output()
  public dataChange= new EventEmitter<McsTicket[]>(null);

  public constructor(
    _injector: Injector,
    private _ticketService: McsApiTicketsService,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2(this._getAzureTickets.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'summary' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'lastUpdatedDate' }),
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
    this.setTicketStatusIconMap();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getAzureTickets(): Observable<McsMatTableContext<McsTicket>> {
    let queryParam = new McsTicketQueryParams();
    queryParam.pageSize = maxTicketsToDisplay;
    queryParam.serviceId = 'AZ';
    queryParam.state = 'open';

    return this._ticketService.getTickets(queryParam).pipe(
      map((response) => {
        this.hasMore = response.totalCount > maxTicketsToDisplay;

        let azureTickets: McsTicket[] = [];
        azureTickets.push(...cloneObject(response.content));

        let dataSourceContext = new McsMatTableContext(azureTickets, azureTickets.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError(() => {
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
    this._ticketStatusIconMap.set(ticketStatusText[TicketStatus.Resolved], CommonDefinition.ASSETS_SVG_CHECK);
  }
}