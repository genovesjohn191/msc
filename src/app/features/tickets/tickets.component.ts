import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
/** Services */
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsTableDataSource
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsTicket
} from '@app/models';
import { McsTicketsRepository } from '@app/services';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class TicketsComponent
  extends McsTableListingBase<McsTableDataSource<McsTicket>>
  implements AfterViewInit, OnDestroy {

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _ticketsRepository: McsTicketsRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Navigate to ticket details page
   * @param ticket Ticket to view the details
   */
  public navigateToTicket(ticket: McsTicket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.TicketDetail), ticket.id]);
  }

  /**
   * This will navigate to ticket creation page
   */
  public onClickNewTicket(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.TicketCreate)]);
  }

  /**
   * Retry obtaining datasource from tickets
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_TICKET_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    this.dataSource = new McsTableDataSource(this._ticketsRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }
}
