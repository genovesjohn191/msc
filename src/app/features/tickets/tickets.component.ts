import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
/** Services */
import {
  McsPaginator,
  McsSearch,
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase
} from '../../core';
import { Router } from '@angular/router';
import {
  isNullOrEmpty,
  getEnumString,
  refreshView,
  getRecordCountLabel
} from '../../utilities';
import { TicketsService } from './tickets.service';
import { TicketsDataSource } from './tickets.datasource';
import { TicketStatus } from './models';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  styles: [require('./tickets.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketsComponent
  extends McsTableListingBase<TicketsDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
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
    private _ticketsService: TicketsService,
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
   * This will navigate to ticket creation page
   */
  public onClickNewTicket(): void {
    this._router.navigate(['./tickets/create']);
  }

  /**
   * Return the status string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getStatusString(status: TicketStatus) {
    return getEnumString(TicketStatus, status);
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource
    this.dataSource = new TicketsDataSource(
      this._ticketsService,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
