import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
/** Services */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  refreshView,
  getSafeProperty
} from '@app/utilities';
import {
  McsRouteKey,
  McsTicket
} from '@app/models';
import { TicketsRepository } from '@app/services';
import { TicketsDataSource } from './tickets.datasource';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class TicketsComponent
  extends McsTableListingBase<TicketsDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _ticketsRepository: TicketsRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.tickets;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  /**
   * Navigate to ticket details page
   * @param ticket Ticket to view the details
   */
  public navigateToTicket(ticket: McsTicket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.TicketDetail), ticket.id]);
  }

  /**
   * This will navigate to ticket creation page
   */
  public onClickNewTicket(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.TicketCreate)]);
  }

  /**
   * Retry obtaining datasource from tickets
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Returns the totals record found in tickets
   */
  protected get totalRecordsCount(): number {
    return getSafeProperty(this._ticketsRepository,
      (obj) => obj.totalRecordsCount, 0);
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
    // Set datasource
    this.dataSource = new TicketsDataSource(
      this._ticketsRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
