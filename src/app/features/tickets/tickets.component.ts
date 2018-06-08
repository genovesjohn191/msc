import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
/** Services */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase
} from '../../core';
import { Router } from '@angular/router';
import {
  isNullOrEmpty,
  refreshView,
  getRecordCountLabel
} from '../../utilities';
import { TicketsRepository } from './tickets.repository';
import { TicketsDataSource } from './tickets.datasource';
import { Ticket } from './models';

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

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._ticketsRepository) ? 0 :
      this._ticketsRepository.totalRecordsCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_TICKET_LISTING;
  }

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
  public navigateToTicket(ticket: Ticket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._router.navigate(['/tickets/', ticket.id]);
  }

  /**
   * This will navigate to ticket creation page
   */
  public onClickNewTicket(): void {
    this._router.navigate(['./tickets/create']);
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
